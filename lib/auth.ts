import { sql } from "./database"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  last_login?: Date
  created_at: Date
  updated_at: Date
}

export interface AdminSession {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
  created_at: Date
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Create admin user
export async function createAdminUser(
  username: string,
  email: string,
  password: string,
  role = "admin",
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO admin_users (username, email, password_hash, role)
      VALUES (${username}, ${email}, ${passwordHash}, ${role})
      RETURNING id, username, email, role, is_active, last_login, created_at, updated_at
    `

    if (result.length > 0) {
      return { success: true, user: result[0] as AdminUser }
    }

    return { success: false, error: "Failed to create user" }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return { success: false, error: error instanceof Error ? error.message : "Database error" }
  }
}

// Authenticate user
export async function authenticateUser(
  username: string,
  password: string,
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const result = await sql`
      SELECT id, username, email, password_hash, role, is_active, last_login, created_at, updated_at
      FROM admin_users
      WHERE username = ${username} AND is_active = true
    `

    if (result.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = result[0] as AdminUser & { password_hash: string }
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // Update last login
    await sql`
      UPDATE admin_users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    // Remove password_hash from returned user object
    const { password_hash, ...userWithoutPassword } = user

    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Create session
export async function createSession(
  userId: number,
): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
  try {
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const result = await sql`
      INSERT INTO admin_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
      RETURNING id, user_id, session_token, expires_at, created_at
    `

    if (result.length > 0) {
      return { success: true, session: result[0] as AdminSession }
    }

    return { success: false, error: "Failed to create session" }
  } catch (error) {
    console.error("Error creating session:", error)
    return { success: false, error: "Session creation failed" }
  }
}

// Validate session
export async function validateSession(
  sessionToken: string,
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const result = await sql`
      SELECT 
        s.id as session_id,
        s.expires_at,
        u.id, u.username, u.email, u.role, u.is_active, u.last_login, u.created_at, u.updated_at
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} 
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = true
    `

    if (result.length === 0) {
      return { success: false, error: "Invalid or expired session" }
    }

    const sessionData = result[0]
    const user: AdminUser = {
      id: sessionData.id,
      username: sessionData.username,
      email: sessionData.email,
      role: sessionData.role,
      is_active: sessionData.is_active,
      last_login: sessionData.last_login,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at,
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error validating session:", error)
    return { success: false, error: "Session validation failed" }
  }
}

// Delete session (logout)
export async function deleteSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      DELETE FROM admin_sessions 
      WHERE session_token = ${sessionToken}
    `

    return { success: true }
  } catch (error) {
    console.error("Error deleting session:", error)
    return { success: false, error: "Logout failed" }
  }
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  try {
    await sql`
      DELETE FROM admin_sessions 
      WHERE expires_at < CURRENT_TIMESTAMP
    `
  } catch (error) {
    console.error("Error cleaning expired sessions:", error)
  }
}
