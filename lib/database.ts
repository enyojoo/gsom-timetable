import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database utility functions
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await sql(query, params)
    return { success: true, data: result }
  } catch (error) {
    console.error("Database query error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Database error" }
  }
}

// Helper function to check if tables exist
export async function checkTablesExist() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('degrees', 'programs', 'groups', 'schedule_events', 'admin_users', 'admin_sessions')
    `
    return result.length === 6
  } catch (error) {
    console.error("Error checking tables:", error)
    return false
  }
}
