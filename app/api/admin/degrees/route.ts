import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
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

    if (!name_en || !name_ru || !code) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO degrees (name_en, name_ru, code)
      VALUES (${name_en}, ${name_ru}, ${code})
      RETURNING id, name_en, name_ru, code, created_at, updated_at
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error creating degree:", error)
    return NextResponse.json({ success: false, message: "Failed to create degree" }, { status: 500 })
  }
}
