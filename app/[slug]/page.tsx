import { parseSlug } from "@/lib/program-utils"
import { redirect } from "next/navigation"
import { LanguageAwareTimetable } from "@/components/language-aware-timetable"
import { TimetableHeader } from "@/components/timetable-header"
import { LanguageMeta } from "@/components/language-meta"
import { sql } from "@/lib/database"
import { unstable_cache } from "next/cache"

interface TimetablePageProps {
  params: {
    slug: string
  }
}

// Function to get schedule data from database
async function getScheduleFromDatabase(groupPattern: string) {
  try {
    // Parse the group pattern to get year and group code
    const parts = groupPattern.split(".")
    if (parts.length < 2) {
      throw new Error("Invalid group pattern")
    }

    const yearPrefix = parts[0]
    const groupCodeWithSuffix = parts[1]
    const groupCode = groupCodeWithSuffix.split("-")[0]
    const year = `20${yearPrefix}`

    // Find the group in database
    const groups = await sql`
      SELECT g.*, p.name_en as program_name_en, p.name_ru as program_name_ru, p.code as program_code
      FROM groups g
      JOIN programs p ON g.program_id = p.id
      WHERE g.full_code = ${groupPattern}
      OR (p.year = ${year} AND g.code = ${groupCode.toUpperCase()})
      LIMIT 1
    `

    if (groups.length === 0) {
      throw new Error("Group not found")
    }

    const group = groups[0]

    // Get schedule events for this group
    const events = await sql`
      SELECT *
      FROM schedule_events
      WHERE group_id = ${group.id}
      ORDER BY event_date, start_time
    `

    // Convert database events to the format expected by the timetable component
    const convertToScheduleEntry = (event: any) => ({
      day: new Date(event.event_date).toLocaleDateString("en-US", { weekday: "long" }),
      time: `${event.start_time} - ${event.end_time}`,
      subject: event.subject_en,
      subjectRu: event.subject_ru,
      type: event.event_type,
      teacher: event.teacher_en,
      teacherRu: event.teacher_ru,
      room: event.room,
      address: event.address,
      group: group.full_code,
    })

    const englishParsedData = events.map(convertToScheduleEntry)
    const russianParsedData = events.map((event: any) => ({
      ...convertToScheduleEntry(event),
      subject: event.subject_ru,
      teacher: event.teacher_ru,
    }))

    return { englishParsedData, russianParsedData }
  } catch (error) {
    console.error("Error fetching schedule from database:", error)
    // Fallback to file-based system
    const { getScheduleFiles } = await import("../api/schedule-data")
    return await getScheduleFiles(groupPattern)
  }
}

// Cache the schedule data with a short TTL
const getCachedScheduleData = unstable_cache(
  async (groupPattern: string) => {
    return await getScheduleFromDatabase(groupPattern)
  },
  ["schedule-data"],
  { revalidate: 60 }, // Revalidate every 60 seconds
)

export default async function TimetablePage({ params }: TimetablePageProps) {
  const { slug } = params

  // Parse the slug to get program, year, and group pattern
  const slugInfo = parseSlug(slug)
  if (!slugInfo) {
    // Redirect to home page if slug format is not valid
    redirect("/")
  }

  try {
    // Get schedule data from database or fallback to files
    const { englishParsedData, russianParsedData } = await getCachedScheduleData(slugInfo.groupPattern)

    // Use the group pattern from the slug info
    const groupToUse = slugInfo.groupPattern

    // Extract the group code for display (e.g., B12)
    const groupCode = slugInfo.groupPattern.split("-")[0].split(".")[1]

    return (
      <main className="container mx-auto pt-6 pb-0 px-4">
        <LanguageMeta />
        <TimetableHeader
          program={slugInfo.program}
          groupCode={groupCode}
          year={slugInfo.year} // Pass the year from slugInfo
        />
        <div className="mb-0">
          <LanguageAwareTimetable
            englishScheduleData={englishParsedData}
            russianScheduleData={russianParsedData}
            academicGroup={groupToUse}
          />
        </div>
      </main>
    )
  } catch (error) {
    // If there's an error loading the schedule data, redirect to home page
    console.error("Error loading schedule data:", error)
    redirect("/")
  }
}
