import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { validateSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    } = await request.json()

    const eventId = Number.parseInt(params.id)

    if (!title_en || !title_ru || !type_en || !type_ru || !start_time || !end_time || !date) {
      return NextResponse.json({ success: false, message: "Required fields are missing" }, { status: 400 })
    }

    const result = await sql`
      UPDATE schedule_events 
      SET 
        title_en = ${title_en},
        title_ru = ${title_ru},
        type_en = ${type_en},
        type_ru = ${type_ru},
        teacher_en = ${teacher_en || null},
        teacher_ru = ${teacher_ru || null},
        room = ${room || null},
        address_en = ${address_en || null},
        address_ru = ${address_ru || null},
        start_time = ${start_time},
        end_time = ${end_time},
        date = ${date},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error("Error updating schedule event:", error)
    return NextResponse.json({ success: false, message: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const eventId = Number.parseInt(params.id)

    const result = await sql`
      DELETE FROM schedule_events WHERE id = ${eventId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting schedule event:", error)
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 })
  }
}
