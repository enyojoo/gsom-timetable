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
          SELECT id, name_en, name_ru, code
          FROM degrees
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: degrees })

      case "programs":
        if (!degreeId) {
          return NextResponse.json({ success: false, error: "Degree ID is required" })
        }

        const programs = await sql`
          SELECT DISTINCT p.id, p.name_en, p.name_ru, p.code, p.year
          FROM programs p
          WHERE p.degree_id = ${degreeId}
          ORDER BY p.name_en, p.year DESC
        `
        return NextResponse.json({ success: true, data: programs })

      case "years":
        if (!programId) {
          return NextResponse.json({ success: false, error: "Program ID is required" })
        }

        const years = await sql`
          SELECT DISTINCT year
          FROM programs
          WHERE id = ${programId}
          ORDER BY year DESC
        `
        return NextResponse.json({ success: true, data: years })

      case "groups":
        if (!programId || !year) {
          return NextResponse.json({ success: false, error: "Program ID and year are required" })
        }

        const groups = await sql`
          SELECT g.id, g.name_en, g.name_ru, g.code, g.full_code
          FROM groups g
          JOIN programs p ON g.program_id = p.id
          WHERE p.id = ${programId} AND p.year = ${year}
          ORDER BY g.code
        `
        return NextResponse.json({ success: true, data: groups })

      case "schedule":
        if (!programId || !year) {
          return NextResponse.json({ success: false, error: "Program ID and year are required" })
        }

        const groupId = searchParams.get("groupId")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        let scheduleQuery = sql`
          SELECT 
            se.*,
            g.name_en as group_name_en,
            g.name_ru as group_name_ru,
            g.code as group_code,
            g.full_code as group_full_code
          FROM schedule_events se
          JOIN groups g ON se.group_id = g.id
          JOIN programs p ON g.program_id = p.id
          WHERE p.id = ${programId} AND p.year = ${year}
        `

        if (groupId) {
          scheduleQuery = sql`
            SELECT 
              se.*,
              g.name_en as group_name_en,
              g.name_ru as group_name_ru,
              g.code as group_code,
              g.full_code as group_full_code
            FROM schedule_events se
            JOIN groups g ON se.group_id = g.id
            WHERE g.id = ${groupId}
          `
        }

        if (startDate && endDate) {
          scheduleQuery = sql`
            ${scheduleQuery}
            AND se.event_date BETWEEN ${startDate} AND ${endDate}
          `
        }

        scheduleQuery = sql`${scheduleQuery} ORDER BY se.event_date, se.start_time`

        const schedule = await scheduleQuery
        return NextResponse.json({ success: true, data: schedule })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" })
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
  }
}
