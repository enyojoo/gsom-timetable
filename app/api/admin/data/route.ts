import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "degrees":
        const degrees = await sql`
          SELECT id, name_en, name_ru, code, created_at 
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
          SELECT p.id, p.name_en, p.name_ru, p.code, p.year, p.degree_id,
                 d.name_en as degree_name_en, d.name_ru as degree_name_ru
          FROM programs p
          JOIN degrees d ON p.degree_id = d.id
          WHERE p.degree_id = ${degreeId}
          ORDER BY p.year DESC, p.name_en
        `
        return NextResponse.json({ success: true, data: programs })

      case "groups":
        const programId = searchParams.get("programId")
        const year = searchParams.get("year")

        let groupsQuery
        if (programId && year) {
          groupsQuery = await sql`
            SELECT g.id, g.program_id, g.year, g.code, g.full_code, g.name_en, g.name_ru,
                   p.name_en as program_name_en, p.name_ru as program_name_ru,
                   d.name_en as degree_name_en, d.name_ru as degree_name_ru
            FROM groups g
            JOIN programs p ON g.program_id = p.id
            JOIN degrees d ON p.degree_id = d.id
            WHERE g.program_id = ${programId} AND g.year = ${year}
            ORDER BY g.code
          `
        } else {
          // Return all groups with their program and degree info
          groupsQuery = await sql`
            SELECT g.id, g.program_id, g.year, g.code, g.full_code, g.name_en, g.name_ru,
                   p.name_en as program_name_en, p.name_ru as program_name_ru,
                   d.name_en as degree_name_en, d.name_ru as degree_name_ru
            FROM groups g
            JOIN programs p ON g.program_id = p.id
            JOIN degrees d ON p.degree_id = d.id
            ORDER BY d.name_en, p.name_en, g.year DESC, g.code
          `
        }
        return NextResponse.json({ success: true, data: groupsQuery })

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
                   se.recurrence_end_date, se.created_at, se.updated_at,
                   g.name_en as group_name_en, g.name_ru as group_name_ru
            FROM schedule_events se
            JOIN groups g ON se.group_id = g.id
            WHERE se.group_id = ${groupId} 
              AND se.date >= ${startDate} 
              AND se.date <= ${endDate}
            ORDER BY se.date, se.start_time
          `
        } else {
          // Return all schedule events for the group
          scheduleQuery = await sql`
            SELECT se.id, se.group_id, se.title_en, se.title_ru, se.type_en, se.type_ru,
                   se.teacher_en, se.teacher_ru, se.room, se.address_en, se.address_ru,
                   se.start_time, se.end_time, se.date, se.is_recurring, se.recurrence_pattern,
                   se.recurrence_end_date, se.created_at, se.updated_at,
                   g.name_en as group_name_en, g.name_ru as group_name_ru
            FROM schedule_events se
            JOIN groups g ON se.group_id = g.id
            WHERE se.group_id = ${groupId}
            ORDER BY se.date, se.start_time
          `
        }
        return NextResponse.json({ success: true, data: scheduleQuery })

      default:
        return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 })
  }
}
