import { NextResponse } from "next/server"

export async function GET() {
  // Only return whether PostHog is enabled, not the actual key
  return NextResponse.json({
    enabled: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  })
}
