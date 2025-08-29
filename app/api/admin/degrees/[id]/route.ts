import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate admin session
    const sessionToken = cookies().get("gsom_admin_session")?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const sessionResult = await validateSession(sessionToken)
    if (!sessionResult.success) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const { name_en, name_ru, code } = await request.json()
    const degreeId = Number.parseInt(params.id)

    if (!name_en || !name_ru || !code) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE degrees 
      SET name_en = ${name_en}, name_ru = ${name_ru}, code = ${code}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${degreeId}
      RETURNING id, name_en, name_ru, code, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Degree not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating degree:", error)
    return NextResponse.json({ success: false, message: "Failed to update degree" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate admin session
    const sessionToken = cookies().get("gsom_admin_session")?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const sessionResult = await validateSession(sessionToken)
    if (!sessionResult.success) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const degreeId = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM degrees WHERE id = ${degreeId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Degree not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Degree deleted successfully" })
  } catch (error) {
    console.error("Error deleting degree:", error)
    return NextResponse.json({ success: false, message: "Failed to delete degree" }, { status: 500 })
  }
}
