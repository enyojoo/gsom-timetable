import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const degreeId = searchParams.get("degreeId")
    const programId = searchParams.get("programId")
    const year = searchParams.get("year")

    switch (type) {
      case "degrees":
        const degrees = await sql`
          SELECT id, code, name_en, name_ru 
          FROM degrees 
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: degrees })

      case "programs":
        if (!degreeId) {
          return NextResponse.json({ success: false, error: "Degree ID required" })
        }
        const programs = await sql`
          SELECT DISTINCT p.id, p.code, p.name_en, p.name_ru, p.degree_id
          FROM programs p
          WHERE p.degree_id = ${degreeId}
          ORDER BY p.name_en
        `
        return NextResponse.json({ success: true, data: programs })

      case "years":
        if (!programId) {
          return NextResponse.json({ success: false, error: "Program ID required" })
        }
        const years = await sql`
          SELECT DISTINCT year
          FROM groups
          WHERE program_id = ${programId}
          ORDER BY year DESC
        `
        return NextResponse.json({ success: true, data: years })

      case "groups":
        if (!programId || !year) {
          return NextResponse.json({ success: false, error: "Program ID and year required" })
        }
        const groups = await sql`
          SELECT id, code, name_en, name_ru, full_code, year, program_id
          FROM groups
          WHERE program_id = ${programId} AND year = ${year}
          ORDER BY code
        `
        return NextResponse.json({ success: true, data: groups })

      case "schedule":
        const groupCode = searchParams.get("groupCode")
        if (!groupCode) {
          return NextResponse.json({ success: false, error: "Group code required" })
        }
        const scheduleEvents = await sql`
          SELECT se.*, g.name_en as group_name_en, g.name_ru as group_name_ru
          FROM schedule_events se
          JOIN groups g ON se.group_id = g.id
          WHERE g.full_code = ${groupCode}
          ORDER BY se.start_time
        `
        return NextResponse.json({ success: true, data: scheduleEvents })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" })
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
  }
}
