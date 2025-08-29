import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authenticateUser, createSession, deleteSession, validateSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, sessionToken } = await request.json()

    switch (action) {
      case "login":
        if (!username || !password) {
          return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
        }

        const authResult = await authenticateUser(username, password)
        if (!authResult.success) {
          return NextResponse.json({ success: false, message: authResult.error }, { status: 401 })
        }

        const sessionResult = await createSession(authResult.user!.id)
        if (!sessionResult.success) {
          return NextResponse.json({ success: false, message: sessionResult.error }, { status: 500 })
        }

        // Set secure cookie with session token
        cookies().set({
          name: "gsom_admin_session",
          value: sessionResult.session!.session_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 24 hours
          path: "/",
        })

        return NextResponse.json({
          success: true,
          user: authResult.user,
          message: "Login successful",
        })

      case "logout":
        const cookieStore = cookies()
        const currentSessionToken = cookieStore.get("gsom_admin_session")?.value

        if (currentSessionToken) {
          await deleteSession(currentSessionToken)
        }

        // Clear the cookie
        cookies().set({
          name: "gsom_admin_session",
          value: "",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 0,
          path: "/",
        })

        return NextResponse.json({ success: true, message: "Logout successful" })

      case "validate":
        const token = sessionToken || cookies().get("gsom_admin_session")?.value

        if (!token) {
          return NextResponse.json({ success: false, message: "No session token" }, { status: 401 })
        }

        const validationResult = await validateSession(token)
        if (!validationResult.success) {
          return NextResponse.json({ success: false, message: validationResult.error }, { status: 401 })
        }

        return NextResponse.json({
          success: true,
          user: validationResult.user,
          message: "Session valid",
        })

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
