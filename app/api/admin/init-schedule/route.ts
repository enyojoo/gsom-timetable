import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { verifyAdminSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Create schedule_events table
    await sql`
      CREATE TABLE IF NOT EXISTS schedule_events (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          title_en VARCHAR(255) NOT NULL,
          title_ru VARCHAR(255) NOT NULL,
          type_en VARCHAR(100) NOT NULL DEFAULT 'Lecture',
          type_ru VARCHAR(100) NOT NULL DEFAULT 'Лекция',
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

    // Insert sample data
    const groups =
      await sql`SELECT id, full_code FROM groups WHERE full_code IN ('24.B01-vshm', '24.B02-vshm', '24.M01-vshm')`

    for (const group of groups) {
      const existingEvents = await sql`SELECT COUNT(*) as count FROM schedule_events WHERE group_id = ${group.id}`

      if (existingEvents[0].count === 0) {
        if (group.full_code === "24.B01-vshm") {
          await sql`
            INSERT INTO schedule_events (group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru, room, address_en, address_ru, start_time, end_time, date) VALUES
            (${group.id}, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция', 'Dr. Smith', 'Д-р Смит', '101', 'Main Building', 'Главное здание', '09:00', '10:30', '2024-12-30'),
            (${group.id}, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар', 'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Center', 'Бизнес-центр', '11:00', '12:30', '2024-12-30'),
            (${group.id}, 'Financial Analysis', 'Финансовый анализ', 'Practical', 'Практическое занятие', 'Dr. Brown', 'Д-р Браун', '301', 'Finance Lab', 'Финансовая лаборатория', '14:00', '15:30', '2024-12-30')
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
        error: "Failed to initialize schedule table",
      },
      { status: 500 },
    )
  }
}
