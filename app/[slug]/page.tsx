import { parseSlug } from "@/lib/program-utils"
import { redirect } from "next/navigation"
import { LanguageAwareTimetable } from "@/components/language-aware-timetable"
import { TimetableHeader } from "@/components/timetable-header"
import { LanguageMeta } from "@/components/language-meta"
import { sql } from "@/lib/database"
import { unstable_cache } from "next/cache"

interface TimetablePageProps {
  params: Promise<{
    slug: string
  }>
}

// Cache the schedule data with a short TTL
const getCachedScheduleData = unstable_cache(
  async (groupPattern: string, degreeCode: string, programCode: string) => {
    try {
      console.log("Looking for group:", { groupPattern, degreeCode, programCode })

      // First, verify that the group exists in the database
      const groupResult = await sql`
        SELECT g.*, p.name_en as program_name_en, p.name_ru as program_name_ru, d.name_en as degree_name_en, d.name_ru as degree_name_ru
        FROM groups g
        JOIN programs p ON g.program_id = p.id
        JOIN degrees d ON p.degree_id = d.id
        WHERE g.full_code = ${groupPattern} AND d.code = ${degreeCode} AND p.code = ${programCode}
      `

      console.log("Group query result:", groupResult)

      if (groupResult.length === 0) {
        // Try to find any group with this pattern for debugging
        const debugResult = await sql`
          SELECT g.full_code, p.code as program_code, d.code as degree_code
          FROM groups g
          JOIN programs p ON g.program_id = p.id
          JOIN degrees d ON p.degree_id = d.id
          LIMIT 10
        `
        console.log("Available groups (debug):", debugResult)
        throw new Error("Group not found in database")
      }

      const group = groupResult[0]

      // Fetch schedule events for this group
      const scheduleEvents = await sql`
        SELECT *
        FROM schedule_events
        WHERE group_id = ${group.id}
        ORDER BY start_time
      `

      console.log("Schedule events found:", scheduleEvents.length)

      // Convert database events to the format expected by the timetable component
      const convertToScheduleEntry = (event: any) => ({
        day: new Date(event.start_time).toLocaleDateString("en-US", { weekday: "long" }),
        time: new Date(event.start_time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        subject: event.subject_en || event.subject_ru,
        type: event.event_type,
        teacher: event.teacher_en || event.teacher_ru,
        room: event.room,
        address: event.address,
      })

      const englishParsedData = scheduleEvents.map(convertToScheduleEntry)
      const russianParsedData = scheduleEvents.map((event) => ({
        ...convertToScheduleEntry(event),
        subject: event.subject_ru || event.subject_en,
        teacher: event.teacher_ru || event.teacher_en,
      }))

      return {
        englishParsedData,
        russianParsedData,
        group,
      }
    } catch (error) {
      console.error("Error fetching schedule data:", error)
      throw error
    }
  },
  ["schedule-data"],
  { revalidate: 60 }, // Revalidate every 60 seconds
)

export default async function TimetablePage({ params }: TimetablePageProps) {
  const { slug } = await params

  console.log("Timetable page accessed with slug:", slug)

  // Parse the slug to get program, year, and group pattern
  const slugInfo = parseSlug(slug)
  console.log("Parsed slug info:", slugInfo)

  if (!slugInfo) {
    console.log("Invalid slug format:", slug)
    redirect("/")
  }

  try {
    // Get schedule data from database
    const { englishParsedData, russianParsedData, group } = await getCachedScheduleData(
      slugInfo.groupPattern,
      slugInfo.degreeCode,
      slugInfo.programCode,
    )

    // Extract the group code for display (e.g., B12)
    const groupCode = slugInfo.groupCode

    console.log("Successfully loaded timetable for:", group.full_code)

    return (
      <main className="container mx-auto pt-6 pb-0 px-4">
        <LanguageMeta />
        <TimetableHeader program={group.program_name_en} groupCode={groupCode} year={slugInfo.year} />
        <div className="mb-0">
          <LanguageAwareTimetable
            englishScheduleData={englishParsedData}
            russianScheduleData={russianParsedData}
            academicGroup={slugInfo.groupPattern}
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
