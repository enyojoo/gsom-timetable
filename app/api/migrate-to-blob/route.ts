import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { put } from "@vercel/blob"

// Blob storage directory for schedule files
const BLOB_DIRECTORY = "gsom-files/schedule/"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { searchParams } = new URL(request.url)
    const authKey = searchParams.get("authKey")
    const deleteLocal = searchParams.get("deleteLocal") === "true"

    if (!authKey || authKey !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get all schedule files from the public/data directory
    const dataDir = path.join(process.cwd(), "public", "data")

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json(
        {
          success: false,
          message: "Data directory not found",
        },
        { status: 404 },
      )
    }

    const files = fs.readdirSync(dataDir)
    const scheduleFiles = files.filter((file) => /^(ru-)?schedule-\d{2}-[bm]\d{2}\.txt$/.test(file))

    if (scheduleFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No schedule files found in the data directory",
        },
        { status: 404 },
      )
    }

    // Migrate each file to Blob storage
    const results = await Promise.all(
      scheduleFiles.map(async (file) => {
        try {
          const filePath = path.join(dataDir, file)
          const content = fs.readFileSync(filePath, "utf8")

          // Save to Blob storage with the correct directory prefix
          const blob = await put(`${BLOB_DIRECTORY}${file}`, content, {
            access: "public",
            addRandomSuffix: false,
            contentType: "text/plain",
            allowOverwrite: true,
          })

          // Delete local file if requested
          if (deleteLocal) {
            try {
              fs.unlinkSync(filePath)
            } catch (deleteError) {
              console.error(`Error deleting local file ${file}:`, deleteError)
              return {
                file,
                success: true,
                url: blob.url,
                deleted: false,
                deleteError: deleteError instanceof Error ? deleteError.message : String(deleteError),
              }
            }
          }

          return {
            file,
            success: true,
            url: blob.url,
            deleted: deleteLocal ? true : undefined,
          }
        } catch (error) {
          console.error(`Error migrating file ${file}:`, error)
          return {
            file,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      }),
    )

    const successCount = results.filter((r) => r.success).length
    const deletedCount = results.filter((r) => r.deleted).length

    let message = `Successfully migrated ${successCount} of ${scheduleFiles.length} files to Blob storage.`
    if (deleteLocal) {
      message += ` Deleted ${deletedCount} local files.`
    }

    return NextResponse.json({
      success: true,
      message,
      results,
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to migrate files",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
