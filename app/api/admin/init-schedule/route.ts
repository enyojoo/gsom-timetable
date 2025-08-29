import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateSession } from "@/lib/auth"
import { cookies } from "next/headers"

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

    // Create schedule_events table
    await sql`
      CREATE TABLE IF NOT EXISTS schedule_events (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          title_en VARCHAR(255) NOT NULL,
          title_ru VARCHAR(255) NOT NULL,
          type_en VARCHAR(100) NOT NULL,
          type_ru VARCHAR(100) NOT NULL,
          teacher_en VARCHAR(255),
          teacher_ru VARCHAR(255),
          room VARCHAR(100),
          address_en VARCHAR(255),
          address_ru VARCHAR(255),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          date DATE NOT NULL,
          is_recurring BOOLEAN DEFAULT FALSE,
          recurrence_pattern VARCHAR(50),
          recurrence_end_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_group_id ON schedule_events(group_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_group_date ON schedule_events(group_id, date)`

    // Check if we have any groups to add sample data
    const groups = await sql`SELECT id FROM groups LIMIT 2`

    if (groups.length > 0) {
      // Insert sample data only if no schedule events exist
      const existingEvents = await sql`SELECT COUNT(*) as count FROM schedule_events`

      if (existingEvents[0].count === 0) {
        const groupIds = groups.map((g) => g.id)

        await sql`
          INSERT INTO schedule_events (
              group_id, title_en, title_ru, type_en, type_ru, 
              teacher_en, teacher_ru, room, address_en, address_ru,
              start_time, end_time, date, is_recurring, recurrence_pattern, recurrence_end_date
          ) VALUES 
          (${groupIds[0]}, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция',
           'Dr. Smith', 'Д-р Смит', '101', 'Main Building', 'Главное здание',
           '09:00:00', '10:30:00', '2024-01-15', true, 'weekly', '2024-05-15'),
          
          (${groupIds[0]}, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар',
           'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Building', 'Бизнес-здание',
           '11:00:00', '12:30:00', '2024-01-16', true, 'weekly', '2024-05-16')
        `

        if (groupIds.length > 1) {
          await sql`
            INSERT INTO schedule_events (
                group_id, title_en, title_ru, type_en, type_ru, 
                teacher_en, teacher_ru, room, address_en, address_ru,
                start_time, end_time, date, is_recurring, recurrence_pattern, recurrence_end_date
            ) VALUES 
            (${groupIds[1]}, 'Advanced Analytics', 'Продвинутая аналитика', 'Practical', 'Практическое занятие',
             'Dr. Brown', 'Д-р Браун', '301', 'IT Building', 'IT-здание',
             '14:00:00', '15:30:00', '2024-01-17', true, 'weekly', '2024-05-17'),
            
            (${groupIds[1]}, 'Digital Transformation', 'Цифровая трансформация', 'Lecture', 'Лекция',
             'Prof. Davis', 'Проф. Дэвис', '102', 'Main Building', 'Главное здание',
             '16:00:00', '17:30:00', '2024-01-18', true, 'weekly', '2024-05-18')
          `
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Schedule table initialized successfully",
      groupsFound: groups.length,
    })
  } catch (error) {
    console.error("Error initializing schedule table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize schedule table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
