import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const degreeId = searchParams.get("degreeId")
    const programId = searchParams.get("programId")
    const year = searchParams.get("year")
    const groupCode = searchParams.get("groupCode")

    switch (type) {
      case "degrees":
        const degrees = await sql`
          SELECT id, name_en, name_ru, code 
          FROM degrees 
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: degrees })

      case "programs":
        if (!degreeId) {
          return NextResponse.json({ success: false, error: "Degree ID required" }, { status: 400 })
        }
        const programs = await sql`
          SELECT id, name_en, name_ru, code 
          FROM programs 
          WHERE degree_id = ${degreeId}
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: programs })

      case "years":
        if (!programId) {
          return NextResponse.json({ success: false, error: "Program ID required" }, { status: 400 })
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
          return NextResponse.json({ success: false, error: "Program ID and year required" }, { status: 400 })
        }
        const groups = await sql`
          SELECT id, code, full_code, name_en, name_ru, year
          FROM groups 
          WHERE program_id = ${programId} AND year = ${year}
          ORDER BY code
        `
        return NextResponse.json({ success: true, data: groups })

      case "schedule":
        if (!groupCode) {
          return NextResponse.json({ success: false, error: "Group code required" }, { status: 400 })
        }
        const schedule = await sql`
          SELECT 
            se.id,
            se.title_en,
            se.title_ru,
            se.type_en,
            se.type_ru,
            se.teacher_en,
            se.teacher_ru,
            se.room,
            se.address_en,
            se.address_ru,
            se.start_time,
            se.end_time,
            se.date,
            g.full_code as group_code
          FROM schedule_events se
          JOIN groups g ON se.group_id = g.id
          WHERE g.full_code = ${groupCode}
          ORDER BY se.date, se.start_time
        `
        return NextResponse.json({ success: true, data: schedule })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Timetable data API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    )
  }
}
