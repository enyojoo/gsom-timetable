import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { addDays, format, parseISO } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const sessionToken = cookies().get("gsom_admin_session")?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const sessionResult = await validateSession(sessionToken)
    if (!sessionResult.success) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const {
      group_id,
      title_en,
      title_ru,
      type_en,
      type_ru,
      teacher_en,
      teacher_ru,
      room,
      address_en,
      address_ru,
      start_time,
      end_time,
      date,
      is_recurring,
      recurrence_pattern,
      recurrence_end_date,
      custom_days,
    } = await request.json()

    if (!group_id || !title_en || !title_ru || !type_en || !type_ru || !start_time || !end_time || !date) {
      return NextResponse.json({ success: false, message: "Required fields are missing" }, { status: 400 })
    }

    // If it's a single event or no recurrence
    if (!is_recurring || recurrence_pattern === "none") {
      const result = await sql`
        INSERT INTO schedule_events (
          group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru,
          room, address_en, address_ru, start_time, end_time, date, is_recurring
        )
        VALUES (
          ${group_id}, ${title_en}, ${title_ru}, ${type_en}, ${type_ru}, ${teacher_en || null}, ${teacher_ru || null},
          ${room || null}, ${address_en || null}, ${address_ru || null}, ${start_time}, ${end_time}, ${date}, false
        )
        RETURNING id
      `

      return NextResponse.json({ success: true, data: result[0] })
    }

    // Handle recurring events
    const events = []
    const startDate = parseISO(date)
    const endDate = parseISO(recurrence_end_date)

    if (recurrence_pattern === "weekly") {
      let currentDate = startDate
      while (currentDate <= endDate) {
        events.push({
          group_id,
          title_en,
          title_ru,
          type_en,
          type_ru,
          teacher_en: teacher_en || null,
          teacher_ru: teacher_ru || null,
          room: room || null,
          address_en: address_en || null,
          address_ru: address_ru || null,
          start_time,
          end_time,
          date: format(currentDate, "yyyy-MM-dd"),
          is_recurring: true,
          recurrence_pattern,
          recurrence_end_date,
        })
        currentDate = addDays(currentDate, 7)
      }
    } else if (recurrence_pattern === "biweekly") {
      let currentDate = startDate
      while (currentDate <= endDate) {
        events.push({
          group_id,
          title_en,
          title_ru,
          type_en,
          type_ru,
          teacher_en: teacher_en || null,
          teacher_ru: teacher_ru || null,
          room: room || null,
          address_en: address_en || null,
          address_ru: address_ru || null,
          start_time,
          end_time,
          date: format(currentDate, "yyyy-MM-dd"),
          is_recurring: true,
          recurrence_pattern,
          recurrence_end_date,
        })
        currentDate = addDays(currentDate, 14)
      }
    } else if (recurrence_pattern === "custom" && custom_days?.length > 0) {
      // Custom pattern implementation would go here
      // For now, we'll create weekly events on selected days
      const dayMap = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      }

      let currentDate = startDate
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay()
        const dayName = Object.keys(dayMap).find((key) => dayMap[key as keyof typeof dayMap] === dayOfWeek)

        if (dayName && custom_days.includes(dayName)) {
          events.push({
            group_id,
            title_en,
            title_ru,
            type_en,
            type_ru,
            teacher_en: teacher_en || null,
            teacher_ru: teacher_ru || null,
            room: room || null,
            address_en: address_en || null,
            address_ru: address_ru || null,
            start_time,
            end_time,
            date: format(currentDate, "yyyy-MM-dd"),
            is_recurring: true,
            recurrence_pattern,
            recurrence_end_date,
          })
        }
        currentDate = addDays(currentDate, 1)
      }
    }

    // Insert all events
    for (const event of events) {
      await sql`
        INSERT INTO schedule_events (
          group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru,
          room, address_en, address_ru, start_time, end_time, date, is_recurring,
          recurrence_pattern, recurrence_end_date
        )
        VALUES (
          ${event.group_id}, ${event.title_en}, ${event.title_ru}, ${event.type_en}, ${event.type_ru},
          ${event.teacher_en}, ${event.teacher_ru}, ${event.room}, ${event.address_en}, ${event.address_ru},
          ${event.start_time}, ${event.end_time}, ${event.date}, ${event.is_recurring},
          ${event.recurrence_pattern || null}, ${event.recurrence_end_date || null}
        )
      `
    }

    return NextResponse.json({ success: true, message: `Created ${events.length} events` })
  } catch (error) {
    console.error("Error creating schedule event:", error)
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 })
  }
}
