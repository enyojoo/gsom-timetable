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
          subject_en VARCHAR(255) NOT NULL,
          subject_ru VARCHAR(255),
          event_type VARCHAR(50) NOT NULL DEFAULT 'Lecture',
          teacher_en VARCHAR(255),
          teacher_ru VARCHAR(255),
          room VARCHAR(100),
          address VARCHAR(255),
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          recurrence_type VARCHAR(20) DEFAULT 'none',
          recurrence_end_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_group_id ON schedule_events(group_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_start_time ON schedule_events(start_time)`
    await sql`CREATE INDEX IF NOT EXISTS idx_schedule_events_group_time ON schedule_events(group_id, start_time)`

    // Check if sample data already exists
    const existingEvents = await sql`SELECT COUNT(*) as count FROM schedule_events`

    if (existingEvents[0].count === 0) {
      // Get some group IDs for sample data
      const groups = await sql`
        SELECT id, full_code FROM groups 
        WHERE full_code IN ('24.B01-vshm', '24.B02-vshm', '23.B01-vshm')
        LIMIT 3
      `

      if (groups.length > 0) {
        // Insert sample events
        for (const group of groups) {
          await sql`
            INSERT INTO schedule_events (group_id, subject_en, subject_ru, event_type, teacher_en, teacher_ru, room, address, start_time, end_time)
            VALUES 
            (${group.id}, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Dr. Smith', 'Др. Смит', '101', 'Main Building', '2024-01-15 09:00:00', '2024-01-15 10:30:00'),
            (${group.id}, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Center', '2024-01-15 11:00:00', '2024-01-15 12:30:00')
          `
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Schedule table initialized successfully",
      eventsCount: existingEvents[0].count,
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
