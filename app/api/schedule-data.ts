import fs from "fs"
import path from "path"
import { parseScheduleData } from "@/lib/parse-schedule"
import { extractProgramData } from "@/lib/program-utils"
import type { ScheduleEntry } from "@/lib/types"

// Global cache for parsed data
const dataCache: Record<string, ScheduleEntry[]> = {}

// Preload common data files in the background
function preloadCommonFiles() {
  const commonFiles = [
    "public/data/schedule-23-b11.txt",
    "public/data/schedule-23-b12.txt",
    "public/data/ru-schedule-23-b11.txt",
    "public/data/ru-schedule-23-b12.txt",
    "public/data/schedule-24-b01.txt",
    "public/data/ru-schedule-24-b01.txt",
  ]

  commonFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath) && !dataCache[filePath]) {
      try {
        const data = fs.readFileSync(filePath, "utf8")
        dataCache[filePath] = parseScheduleData(data)
      } catch (e) {
        // Silently fail - this is just preloading
      }
    }
  })
}

// Try to preload common files immediately
try {
  preloadCommonFiles()
} catch (e) {
  // Ignore errors during preloading
}

export async function getScheduleData() {
  const scheduleFilePath = path.join(process.cwd(), "public/data/schedule-23-b12.txt")

  // Use cached data if available
  if (!dataCache[scheduleFilePath] && fs.existsSync(scheduleFilePath)) {
    const scheduleData = fs.readFileSync(scheduleFilePath, "utf8")
    dataCache[scheduleFilePath] = parseScheduleData(scheduleData)
  }

  const parsedData = dataCache[scheduleFilePath] || []
  const { programs, years, groups } = extractProgramData(parsedData)

  return { programs, years, groups }
}

export async function getScheduleFiles(groupPattern?: string) {
  // Default files
  let englishScheduleFilePath = path.join(process.cwd(), "public/data/schedule-23-b12.txt")
  let russianScheduleFilePath = path.join(process.cwd(), "public/data/ru-schedule-23-b12.txt")

  // If a specific group pattern is provided, use the corresponding files
  if (groupPattern) {
    const parts = groupPattern.split("-")
    if (parts.length >= 1) {
      const programParts = parts[0].split(".")
      if (programParts.length >= 2) {
        const yearPrefix = programParts[0]
        const groupCode = programParts[1].toLowerCase()

        // Construct file paths
        const specificEnglishFilePath = path.join(process.cwd(), `public/data/schedule-${yearPrefix}-${groupCode}.txt`)
        const specificRussianFilePath = path.join(
          process.cwd(),
          `public/data/ru-schedule-${yearPrefix}-${groupCode}.txt`,
        )

        // Check if files exist and use them
        if (fs.existsSync(specificEnglishFilePath)) {
          englishScheduleFilePath = specificEnglishFilePath
        }

        if (fs.existsSync(specificRussianFilePath)) {
          russianScheduleFilePath = specificRussianFilePath
        }
      }
    }
  }

  // Get English data from cache or parse it
  let englishParsedData: ScheduleEntry[] = []
  if (dataCache[englishScheduleFilePath]) {
    englishParsedData = dataCache[englishScheduleFilePath]
  } else if (fs.existsSync(englishScheduleFilePath)) {
    const englishScheduleData = fs.readFileSync(englishScheduleFilePath, "utf8")
    englishParsedData = parseScheduleData(englishScheduleData)
    dataCache[englishScheduleFilePath] = englishParsedData
  }

  // Get Russian data from cache or parse it
  let russianParsedData: ScheduleEntry[] = []
  if (dataCache[russianScheduleFilePath]) {
    russianParsedData = dataCache[russianScheduleFilePath]
  } else if (fs.existsSync(russianScheduleFilePath)) {
    const russianScheduleData = fs.readFileSync(russianScheduleFilePath, "utf8")
    russianParsedData = parseScheduleData(russianScheduleData)
    dataCache[russianScheduleFilePath] = russianParsedData
  }

  return { englishParsedData, russianParsedData }
}
