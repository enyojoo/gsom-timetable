import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { put } from "@vercel/blob"

// Blob storage directory for schedule files
const BLOB_DIRECTORY = "gsom-files/schedule/"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { fileName, content } = body

    if (!fileName || !content) {
      return NextResponse.json({ success: false, message: "File name and content are required" }, { status: 400 })
    }

    // Validate the file name to prevent directory traversal attacks
    if (!/^(ru-)?schedule-\d{2}-[bm]\d{2}\.txt$/.test(fileName)) {
      return NextResponse.json({ success: false, message: "Invalid file name format" }, { status: 400 })
    }

    // Save to Blob storage
    try {
      const blob = await put(`${BLOB_DIRECTORY}${fileName}`, content, {
        access: "public",
        addRandomSuffix: false,
        contentType: "text/plain",
        allowOverwrite: true,
      })

      // In development, also save to local file system
      if (process.env.NODE_ENV === "development") {
        const filePath = path.join(process.cwd(), "public", "data", fileName)
        fs.writeFileSync(filePath, content, "utf8")
      }

      return NextResponse.json({
        success: true,
        message: "File updated successfully",
        url: blob.url,
      })
    } catch (error) {
      console.error("Error saving to Blob storage:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save to Blob storage",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json(
      { success: false, message: "Server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
