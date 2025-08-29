import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { list } from "@vercel/blob"

// Blob storage directory for schedule files
const BLOB_DIRECTORY = "gsom-files/schedule/"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return NextResponse.json({ message: "File name is required" }, { status: 400 })
    }

    // Validate file name to prevent directory traversal attacks
    if (!/^(ru-)?schedule-\d{2}-[bm]\d{2}\.txt$/.test(fileName)) {
      return NextResponse.json({ message: "Invalid file name format" }, { status: 400 })
    }

    // Try to get the file from Vercel Blob storage first
    try {
      const { blobs } = await list({ prefix: `${BLOB_DIRECTORY}${fileName}` })

      if (blobs.length > 0) {
        // Sort by uploadedAt to get the most recent version
        blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

        const blobResponse = await fetch(blobs[0].url)

        if (!blobResponse.ok) {
          throw new Error(`Failed to fetch blob: ${blobResponse.statusText}`)
        }

        const content = await blobResponse.text()

        return new Response(content, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })
      }
    } catch (blobError) {
      console.error("Blob storage error:", blobError)
      // Only in development, continue to try local file system
      if (process.env.NODE_ENV !== "production") {
        console.log("Falling back to local file system in development mode")
      } else {
        // In production, return a 404 if the blob doesn't exist
        return NextResponse.json(
          {
            message: "File not found in Blob storage",
            error: blobError instanceof Error ? blobError.message : String(blobError),
          },
          { status: 404 },
        )
      }
    }

    // Fall back to local file system only in development
    if (process.env.NODE_ENV !== "production") {
      const filePath = path.join(process.cwd(), "public", "data", fileName)

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ message: "File not found in local file system" }, { status: 404 })
      }

      const content = fs.readFileSync(filePath, "utf8")

      return new Response(content, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // If we get here in production, the file wasn't found in Blob storage
    return NextResponse.json({ message: "File not found" }, { status: 404 })
  } catch (error) {
    console.error("Schedule file error:", error)
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
