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

    const { program_id, year, code, full_code, name_en, name_ru } = await request.json()
    const groupId = Number.parseInt(params.id)

    if (!program_id || !year || !code || !full_code || !name_en || !name_ru) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE groups 
      SET program_id = ${program_id}, year = ${year}, code = ${code}, full_code = ${full_code}, 
          name_en = ${name_en}, name_ru = ${name_ru}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${groupId}
      RETURNING id, program_id, year, code, full_code, name_en, name_ru, created_at, updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Group not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating group:", error)
    return NextResponse.json({ success: false, message: "Failed to update group" }, { status: 500 })
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

    const groupId = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM groups WHERE id = ${groupId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Group not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Group deleted successfully" })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ success: false, message: "Failed to delete group" }, { status: 500 })
  }
}
