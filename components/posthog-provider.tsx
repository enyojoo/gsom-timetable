"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { usePostHog } from "posthog-js/react"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initPostHog = async () => {
      try {
        // Use the public environment variable directly
        const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

        // Fetch configuration from server-side API route
        const response = await fetch("/api/posthog-config")
        const { enabled, apiHost } = await response.json()

        if (apiKey && enabled) {
          posthog.init(apiKey, {
            api_host: apiHost,
            person_profiles: "identified_only",
            capture_pageview: false,
          })
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("Failed to initialize PostHog:", error)
      }
    }

    if (!isInitialized) {
      initPostHog()
    }
  }, [isInitialized])

  // Only render the PostHog provider if PostHog is initialized
  if (!isInitialized) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }

      posthog.capture("$pageview", { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
