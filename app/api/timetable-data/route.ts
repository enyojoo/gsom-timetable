import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "degrees":
        const degrees = await sql`
          SELECT id, name_en, name_ru, code
          FROM degrees
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: degrees })

      case "programs":
        const degreeId = searchParams.get("degreeId")
        if (!degreeId) {
          return NextResponse.json({ success: false, message: "Degree ID is required" }, { status: 400 })
        }

        const programs = await sql`
          SELECT DISTINCT p.id, p.name_en, p.name_ru, p.code, g.year
          FROM programs p
          JOIN groups g ON p.id = g.program_id
          WHERE p.degree_id = ${degreeId}
          ORDER BY g.year DESC, p.name_en
        `
        return NextResponse.json({ success: true, data: programs })

      case "years":
        const programId = searchParams.get("programId")
        if (!programId) {
          return NextResponse.json({ success: false, message: "Program ID is required" }, { status: 400 })
        }

        const years = await sql`
          SELECT DISTINCT year
          FROM groups
          WHERE program_id = ${programId}
          ORDER BY year DESC
        `
        return NextResponse.json({ success: true, data: years })

      case "groups":
        const groupProgramId = searchParams.get("programId")
        const year = searchParams.get("year")

        if (!groupProgramId || !year) {
          return NextResponse.json({ success: false, message: "Program ID and year are required" }, { status: 400 })
        }

        const groups = await sql`
          SELECT g.id, g.program_id, g.year, g.code, g.full_code, g.name_en, g.name_ru,
                 p.name_en as program_name_en, p.name_ru as program_name_ru,
                 d.name_en as degree_name_en, d.name_ru as degree_name_ru
          FROM groups g
          JOIN programs p ON g.program_id = p.id
          JOIN degrees d ON p.degree_id = d.id
          WHERE g.program_id = ${groupProgramId} AND g.year = ${year}
          ORDER BY g.code
        `
        return NextResponse.json({ success: true, data: groups })

      case "schedule":
        const groupId = searchParams.get("groupId")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        if (!groupId) {
          return NextResponse.json({ success: false, message: "Group ID is required" }, { status: 400 })
        }

        let scheduleQuery
        if (startDate && endDate) {
          scheduleQuery = await sql`
            SELECT se.id, se.group_id, se.title_en, se.title_ru, se.type_en, se.type_ru,
                   se.teacher_en, se.teacher_ru, se.room, se.address_en, se.address_ru,
                   se.start_time, se.end_time, se.date, se.is_recurring, se.recurrence_pattern,
                   se.recurrence_end_date
            FROM schedule_events se
            WHERE se.group_id = ${groupId} 
              AND se.date >= ${startDate} 
              AND se.date <= ${endDate}
            ORDER BY se.date, se.start_time
          `
        } else {
          scheduleQuery = await sql`
            SELECT se.id, se.group_id, se.title_en, se.title_ru, se.type_en, se.type_ru,
                   se.teacher_en, se.teacher_ru, se.room, se.address_en, se.address_ru,
                   se.start_time, se.end_time, se.date, se.is_recurring, se.recurrence_pattern,
                   se.recurrence_end_date
            FROM schedule_events se
            WHERE se.group_id = ${groupId}
            ORDER BY se.date, se.start_time
          `
        }
        return NextResponse.json({ success: true, data: scheduleQuery })

      default:
        return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching timetable data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 })
  }
}
