import { notFound } from "next/navigation"
import { parseSlug } from "@/lib/program-utils"
import { sql } from "@/lib/database"
import { LanguageAwareTimetable } from "@/components/language-aware-timetable"
import { LanguageMeta } from "@/components/language-meta"
import type { ScheduleEntry } from "@/lib/types"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function TimetablePage({ params }: PageProps) {
  const { slug } = await params

  console.log("Slug page accessed with:", slug)

  // Parse the slug to extract components
  const parsedSlug = parseSlug(slug)
  console.log("Parsed slug:", parsedSlug)

  if (!parsedSlug) {
    console.log("Invalid slug format")
    notFound()
  }

  const { degreeCode, programCode, year, groupCode, groupPattern } = parsedSlug

  try {
    // Find the group in the database using the parsed information
    console.log("Looking for group with pattern:", groupPattern)

    const groupResult = await sql`
      SELECT g.id, g.code, g.name_en, g.name_ru, g.full_code, g.year,
             p.code as program_code, p.name_en as program_name_en, p.name_ru as program_name_ru,
             d.code as degree_code, d.name_en as degree_name_en, d.name_ru as degree_name_ru
      FROM groups g
      JOIN programs p ON g.program_id = p.id
      JOIN degrees d ON p.degree_id = d.id
      WHERE g.full_code = ${groupPattern}
        AND p.code = ${programCode}
        AND d.code = ${degreeCode}
        AND g.year = ${Number.parseInt(year)}
    `

    console.log("Group query result:", groupResult)

    if (groupResult.length === 0) {
      console.log("Group not found, checking what groups exist...")

      // Debug: Show what groups exist
      const allGroups = await sql`
        SELECT g.full_code, p.code as program_code, d.code as degree_code, g.year
        FROM groups g
        JOIN programs p ON g.program_id = p.id
        JOIN degrees d ON p.degree_id = d.id
        ORDER BY g.year DESC, p.code, g.code
        LIMIT 10
      `

      console.log("Available groups:", allGroups)
      notFound()
    }

    const group = groupResult[0]
    console.log("Found group:", group)

    // Fetch schedule events for this group
    const scheduleEvents = await sql`
      SELECT id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru,
             room, address_en, address_ru, start_time, end_time, date,
             is_recurring, recurrence_pattern, recurrence_end_date
      FROM schedule_events
      WHERE group_id = ${group.id}
      ORDER BY date, start_time
    `

    console.log("Schedule events found:", scheduleEvents.length)

    // Convert database events to the format expected by the timetable component
    const scheduleData: ScheduleEntry[] = scheduleEvents.map((event: any) => ({
      time: event.start_time,
      endTime: event.end_time,
      subject: event.title_en || event.title_ru || "Unknown Subject",
      subjectRu: event.title_ru || event.title_en || "Неизвестный предмет",
      type: event.type_en || "Lecture",
      typeRu: event.type_ru || "Лекция",
      teacher: event.teacher_en || event.teacher_ru || "",
      teacherRu: event.teacher_ru || event.teacher_en || "",
      room: event.room || "",
      address: event.address_en || event.address_ru || "",
      addressRu: event.address_ru || event.address_en || "",
      date: event.date,
    }))

    console.log("Converted schedule data:", scheduleData.length, "entries")

    const groupInfo = {
      degree: group.degree_name_en,
      degreeRu: group.degree_name_ru,
      program: group.program_name_en,
      programRu: group.program_name_ru,
      year: group.year.toString(),
      group: group.name_en,
      groupRu: group.name_ru,
      fullCode: group.full_code,
    }

    return (
      <main className="container mx-auto pt-6 pb-0 px-4">
        <LanguageMeta />
        <LanguageAwareTimetable scheduleData={scheduleData} groupInfo={groupInfo} />
      </main>
    )
  } catch (error) {
    console.error("Database error in slug page:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const parsedSlug = parseSlug(slug)

  if (!parsedSlug) {
    return {
      title: "Timetable Not Found",
    }
  }

  return {
    title: `Timetable - ${parsedSlug.programCode.toUpperCase()} ${parsedSlug.year} ${parsedSlug.groupCode.toUpperCase()}`,
    description: `University timetable for ${parsedSlug.programCode} program, year ${parsedSlug.year}, group ${parsedSlug.groupCode}`,
  }
}
