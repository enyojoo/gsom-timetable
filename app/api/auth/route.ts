import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

// In a real application, you would store this in an environment variable
const ADMIN_PASSWORD = "gsom-admin-2024"

export async function POST(request: NextRequest) {
  try {
    // Clone the request before reading its body
    const clonedRequest = request.clone()
    const { password } = await clonedRequest.json()

    if (!password) {
      return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 })
    }

    // Simple password check - in a real app, you'd use a proper auth system
    if (password === ADMIN_PASSWORD) {
      // Generate a session token
      const token = crypto.randomBytes(32).toString("hex")

      // Set a secure cookie with the token
      cookies().set({
        name: "gsom_admin_session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
