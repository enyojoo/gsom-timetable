import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/lib/language-context"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { PostHogProvider } from "@/components/posthog-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GSOM Timetable",
  description: "Timetable for Graduate School of Management, SPbU",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "GSOM Timetable",
    description: "Timetable for Graduate School of Management, SPbU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GSOM Timetable",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSOM Timetable",
    description: "Timetable for Graduate School of Management, SPbU",
    images: ["/og-image.png"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">
              <div className="flex-grow">{children}</div>
              <Footer />
            </div>
          </LanguageProvider>
        </PostHogProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
