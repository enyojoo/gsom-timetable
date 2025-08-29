import { notFound } from "next/navigation"
import { parseSlug } from "@/lib/program-utils"
import { sql } from "@/lib/database"
import { LanguageAwareTimetable } from "@/components/language-aware-timetable"

interface ScheduleEvent {
  id: number
  title_en: string
  title_ru: string
  type_en: string
  type_ru: string
  teacher_en?: string
  teacher_ru?: string
  room?: string
  address_en?: string
  address_ru?: string
  start_time: string
  end_time: string
  date: string
  group_code: string
}

interface TimetableEvent {
  id: string
  subject: { en: string; ru: string }
  type: { en: string; ru: string }
  teacher?: { en: string; ru: string }
  room?: string
  address?: { en: string; ru: string }
  time: string
  day: string
}

async function getScheduleData(fullCode: string): Promise<TimetableEvent[]> {
  try {
    console.log("Fetching schedule for group:", fullCode)

    // First, check if the group exists
    const groupCheck = await sql`
      SELECT id, full_code, name_en, name_ru 
      FROM groups 
      WHERE full_code = ${fullCode}
    `

    console.log("Group check result:", groupCheck)

    if (groupCheck.length === 0) {
      console.log("Group not found, checking all available groups:")
      const allGroups = await sql`
        SELECT full_code, name_en, name_ru 
        FROM groups 
        ORDER BY full_code
      `
      console.log("Available groups:", allGroups)
      return []
    }

    // Fetch schedule events
    const events = (await sql`
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
      WHERE g.full_code = ${fullCode}
      ORDER BY se.date, se.start_time
    `) as ScheduleEvent[]

    console.log("Found events:", events.length)

    // Convert to timetable format
    const timetableEvents: TimetableEvent[] = events.map((event) => {
      const eventDate = new Date(event.date)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const dayName = dayNames[eventDate.getDay()]

      return {
        id: event.id.toString(),
        subject: {
          en: event.title_en,
          ru: event.title_ru,
        },
        type: {
          en: event.type_en,
          ru: event.type_ru,
        },
        teacher:
          event.teacher_en && event.teacher_ru
            ? {
                en: event.teacher_en,
                ru: event.teacher_ru,
              }
            : undefined,
        room: event.room || undefined,
        address:
          event.address_en && event.address_ru
            ? {
                en: event.address_en,
                ru: event.address_ru,
              }
            : undefined,
        time: `${event.start_time.slice(0, 5)}-${event.end_time.slice(0, 5)}`,
        day: dayName,
      }
    })

    return timetableEvents
  } catch (error) {
    console.error("Error fetching schedule data:", error)
    return []
  }
}

export default async function TimetablePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  console.log("Timetable page accessed with slug:", slug)

  const programInfo = parseSlug(slug)

  if (!programInfo) {
    console.log("Failed to parse slug, redirecting to not found")
    notFound()
  }

  console.log("Parsed program info:", programInfo)

  // Get schedule data from database
  const scheduleData = await getScheduleData(programInfo.fullCode)

  if (scheduleData.length === 0) {
    console.log("No schedule data found for:", programInfo.fullCode)
    // Still show the page but with empty schedule
  }

  console.log("Rendering timetable with", scheduleData.length, "events")

  return <LanguageAwareTimetable programInfo={programInfo} scheduleData={scheduleData} />
}
