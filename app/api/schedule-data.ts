import fs from "fs"
import path from "path"
import { parseScheduleData } from "@/lib/parse-schedule"
import { extractProgramData } from "@/lib/program-utils"
import type { ScheduleEntry } from "@/lib/types"
import { NextResponse } from "next/server"
import { list } from "@vercel/blob"

// Global cache for parsed data with TTL
const dataCache: Record<string, { data: ScheduleEntry[]; timestamp: number }> = {}
const CACHE_TTL = 60 * 1000 // 1 minute cache TTL

// Blob storage directory for schedule files
const BLOB_DIRECTORY = "gsom-files/schedule/"

export async function getScheduleData() {
  // Default file to use for program/year/group extraction
  const defaultFileName = "schedule-23-b12.txt"

  // Use cached data if available and not expired
  const cacheKey = `blob:${BLOB_DIRECTORY}${defaultFileName}`
  const now = Date.now()

  if (dataCache[cacheKey] && now - dataCache[cacheKey].timestamp <= CACHE_TTL) {
    const parsedData = dataCache[cacheKey].data || []
    const { programs, years, groups } = extractProgramData(parsedData)
    return { programs, years, groups }
  }

  try {
    // First try to get from Vercel Blob
    const { blobs } = await list({ prefix: `${BLOB_DIRECTORY}${defaultFileName}` })

    if (blobs.length > 0) {
      // Sort by timestamp to get the most recent version
      const latestBlob = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

      const response = await fetch(latestBlob.url)

      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`)
      }

      const scheduleData = await response.text()
      const parsedData = parseScheduleData(scheduleData)

      // Cache the data
      dataCache[cacheKey] = {
        data: parsedData,
        timestamp: now,
      }

      const { programs, years, groups } = extractProgramData(parsedData)
      return { programs, years, groups }
    }
  } catch (error) {
    console.error("Error fetching from Blob storage:", error)
    // Fall back to local file only in development
  }

  // Fall back to local file if Blob storage fails or file not found (only in development)
  if (process.env.NODE_ENV !== "production") {
    try {
      const scheduleFilePath = path.join(process.cwd(), "public/data", defaultFileName)

      if (fs.existsSync(scheduleFilePath)) {
        const scheduleData = fs.readFileSync(scheduleFilePath, "utf8")
        const parsedData = parseScheduleData(scheduleData)

        // Cache the data
        dataCache[cacheKey] = {
          data: parsedData,
          timestamp: now,
        }

        const { programs, years, groups } = extractProgramData(parsedData)
        return { programs, years, groups }
      }
    } catch (error) {
      console.error("Error fetching from local file:", error)
    }
  }

  // Return empty data if all methods fail
  return { programs: [], years: [], groups: [] }
}

export async function getScheduleFiles(groupPattern?: string) {
  // Default files
  let englishFileName = "schedule-23-b12.txt"
  let russianFileName = "ru-schedule-23-b12.txt"

  // If a specific group pattern is provided, use the corresponding files
  if (groupPattern) {
    const parts = groupPattern.split("-")
    if (parts.length >= 1) {
      const programParts = parts[0].split(".")
      if (programParts.length >= 2) {
        const yearPrefix = programParts[0]
        const groupCode = programParts[1].toLowerCase()

        // Construct file names
        englishFileName = `schedule-${yearPrefix}-${groupCode}.txt`
        russianFileName = `ru-schedule-${yearPrefix}-${groupCode}.txt`
      }
    }
  }

  // Get English data
  let englishParsedData: ScheduleEntry[] = []
  const now = Date.now()
  const englishCacheKey = `blob:${BLOB_DIRECTORY}${englishFileName}`

  // Check if cache is valid
  if (dataCache[englishCacheKey] && now - dataCache[englishCacheKey].timestamp <= CACHE_TTL) {
    englishParsedData = dataCache[englishCacheKey].data
  } else {
    try {
      // First try to get from Vercel Blob
      const { blobs } = await list({ prefix: `${BLOB_DIRECTORY}${englishFileName}` })

      if (blobs.length > 0) {
        // Sort by timestamp to get the most recent version
        const latestBlob = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

        const response = await fetch(latestBlob.url)

        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.statusText}`)
        }

        const scheduleData = await response.text()
        englishParsedData = parseScheduleData(scheduleData)
        dataCache[englishCacheKey] = { data: englishParsedData, timestamp: now }
      } else if (process.env.NODE_ENV !== "production") {
        // Fall back to local file only in development
        const englishScheduleFilePath = path.join(process.cwd(), "public/data", englishFileName)

        if (fs.existsSync(englishScheduleFilePath)) {
          const englishScheduleData = fs.readFileSync(englishScheduleFilePath, "utf8")
          englishParsedData = parseScheduleData(englishScheduleData)
          dataCache[englishCacheKey] = { data: englishParsedData, timestamp: now }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${englishFileName}:`, error)

      // Fall back to local file if Blob storage fails (only in development)
      if (process.env.NODE_ENV !== "production") {
        try {
          const englishScheduleFilePath = path.join(process.cwd(), "public/data", englishFileName)

          if (fs.existsSync(englishScheduleFilePath)) {
            const englishScheduleData = fs.readFileSync(englishScheduleFilePath, "utf8")
            englishParsedData = parseScheduleData(englishScheduleData)
            dataCache[englishCacheKey] = { data: englishParsedData, timestamp: now }
          }
        } catch (localError) {
          console.error(`Error fetching local file ${englishFileName}:`, localError)
        }
      }
    }
  }

  // Get Russian data
  let russianParsedData: ScheduleEntry[] = []
  const russianCacheKey = `blob:${BLOB_DIRECTORY}${russianFileName}`

  // Check if cache is valid
  if (dataCache[russianCacheKey] && now - dataCache[russianCacheKey].timestamp <= CACHE_TTL) {
    russianParsedData = dataCache[russianCacheKey].data
  } else {
    try {
      // First try to get from Vercel Blob
      const { blobs } = await list({ prefix: `${BLOB_DIRECTORY}${russianFileName}` })

      if (blobs.length > 0) {
        // Sort by timestamp to get the most recent version
        const latestBlob = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0]

        const response = await fetch(latestBlob.url)

        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.statusText}`)
        }

        const scheduleData = await response.text()
        russianParsedData = parseScheduleData(scheduleData)
        dataCache[russianCacheKey] = { data: russianParsedData, timestamp: now }
      } else if (process.env.NODE_ENV !== "production") {
        // Fall back to local file only in development
        const russianScheduleFilePath = path.join(process.cwd(), "public/data", russianFileName)

        if (fs.existsSync(russianScheduleFilePath)) {
          const russianScheduleData = fs.readFileSync(russianScheduleFilePath, "utf8")
          russianParsedData = parseScheduleData(russianScheduleData)
          dataCache[russianCacheKey] = { data: russianParsedData, timestamp: now }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${russianFileName}:`, error)

      // Fall back to local file if Blob storage fails (only in development)
      if (process.env.NODE_ENV !== "production") {
        try {
          const russianScheduleFilePath = path.join(process.cwd(), "public/data", russianFileName)

          if (fs.existsSync(russianScheduleFilePath)) {
            const russianScheduleData = fs.readFileSync(russianScheduleFilePath, "utf8")
            russianParsedData = parseScheduleData(russianScheduleData)
            dataCache[russianCacheKey] = { data: russianParsedData, timestamp: now }
          }
        } catch (localError) {
          console.error(`Error fetching local file ${russianFileName}:`, localError)
        }
      }
    }
  }

  return { englishParsedData, russianParsedData }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const year = url.searchParams.get("year") || "24"
  const group = url.searchParams.get("group") || "b01"
  const language = url.searchParams.get("language") || "en"

  try {
    // Use the schedule-file API to get the latest data
    const fileName = `${language === "ru" ? "ru-" : ""}schedule-${year}-${group}.txt`
    const response = await fetch(`${url.origin}/api/schedule-file?file=${fileName}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule file: ${response.statusText}`)
    }

    const fileContent = await response.text()
    const parsedData = parseScheduleData(fileContent)

    return NextResponse.json({ success: true, data: parsedData })
  } catch (error) {
    console.error("Error fetching schedule data:", error)
    return NextResponse.json({ error: "Failed to fetch schedule data" }, { status: 500 })
  }
}
