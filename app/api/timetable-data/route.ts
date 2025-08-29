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
          return NextResponse.json({ success: false, error: "degreeId is required" })
        }
        const programs = await sql`
          SELECT id, code, name_en, name_ru, degree_id
          FROM programs
          WHERE degree_id = ${degreeId}
          ORDER BY name_en
        `
        return NextResponse.json({ success: true, data: programs })

      case "years":
        if (!programId) {
          return NextResponse.json({ success: false, error: "programId is required" })
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
          return NextResponse.json({ success: false, error: "programId and year are required" })
        }
        const groups = await sql`
          SELECT id, code, name_en, name_ru, full_code, year
          FROM groups
          WHERE program_id = ${programId} AND year = ${year}
          ORDER BY code
        `
        return NextResponse.json({ success: true, data: groups })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" })
    }
  } catch (error) {
    console.error("Error in timetable-data API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" })
  }
}
