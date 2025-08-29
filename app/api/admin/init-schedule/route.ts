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
          title_ru VARCHAR(255),
          type_en VARCHAR(100) NOT NULL DEFAULT 'Lecture',
          type_ru VARCHAR(100) DEFAULT 'Лекция',
          teacher_en VARCHAR(255),
          teacher_ru VARCHAR(255),
          room VARCHAR(50),
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

    // Check if we already have sample data
    const existingEvents = await sql`SELECT COUNT(*) as count FROM schedule_events`

    if (existingEvents[0].count === 0) {
      // Get some group IDs for sample data
      const groups = await sql`SELECT id FROM groups LIMIT 2`

      if (groups.length > 0) {
        const group1 = groups[0].id
        const group2 = groups.length > 1 ? groups[1].id : group1

        // Insert sample events
        await sql`
          INSERT INTO schedule_events (
              group_id, title_en, title_ru, type_en, type_ru, 
              teacher_en, teacher_ru, room, address_en, address_ru,
              start_time, end_time, date
          ) VALUES
          (${group1}, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция',
           'Dr. Smith', 'Др. Смит', 'A101', 'Main Building', 'Главное здание',
           '09:00', '10:30', CURRENT_DATE),
          (${group1}, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар',
           'Prof. Johnson', 'Проф. Джонсон', 'B205', 'Business Building', 'Бизнес здание',
           '11:00', '12:30', CURRENT_DATE),
          (${group2}, 'Advanced Analytics', 'Продвинутая аналитика', 'Lecture', 'Лекция',
           'Dr. Wilson', 'Др. Уилсон', 'D401', 'Tech Building', 'Технологическое здание',
           '10:00', '11:30', CURRENT_DATE)
        `
      }
    }

    return NextResponse.json({
      success: true,
      message: "Schedule table initialized successfully",
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
