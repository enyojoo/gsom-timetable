import type { ScheduleEntry } from "./types"

interface ProgramData {
  programs: string[]
  years: string[]
  groups: Record<string, string[]>
}

export function extractProgramData(scheduleData: ScheduleEntry[]): ProgramData {
  // Define the programs and years based on the provided information
  const programs = ["International Management", "Management", "Public Administration"]
  const years = ["2024", "2023", "2022"]

  // Define the groups for each program and year
  const groups: Record<string, string[]> = {
    "International Management-2021": ["21.B10-vshm", "21.B11-vshm", "21.B12-vshm"],
    "International Management-2022": ["22.B12-vshm", "22.B13-vshm"],
    "International Management-2023": ["23.B11-vshm", "23.B12-vshm"],
    "International Management-2024": ["24.B11-vshm", "24.B12-vshm"],
    "Management-2022": [
      "22.B01-vshm",
      "22.B02-vshm",
      "22.B03-vshm",
      "22.B04-vshm",
      "22.B05-vshm",
      "22.B06-vshm",
      "22.B07-vshm",
      "22.B08-vshm",
    ],
    "Management-2023": [
      "23.B01-vshm",
      "23.B02-vshm",
      "23.B03-vshm",
      "23.B04-vshm",
      "23.B05-vshm",
      "23.B06-vshm",
      "23.B07-vshm",
    ],
    // Management-2024 groups B01-B08
    "Management-2024": [
      "24.B01-vshm",
      "24.B02-vshm",
      "24.B03-vshm",
      "24.B04-vshm",
      "24.B05-vshm",
      "24.B06-vshm",
      "24.B07-vshm",
      "24.B08-vshm",
    ],
    // Public Administration-2021 groups B09 and B13
    "Public Administration-2021": ["21.B09-vshm", "21.B13-vshm"],
    "Management-2021": [
      "21.B01-vshm",
      "21.B02-vshm",
      "21.B03-vshm",
      "21.B04-vshm",
      "21.B05-vshm",
      "21.B06-vshm",
      "21.B07-vshm",
      "21.B08-vshm",
      "21.B14-vshm",
    ],
    // Public Administration-2023 groups B09-B10
    "Public Administration-2023": ["23.B09-vshm", "23.B10-vshm"],
    // Public Administration-2024 groups B09-B10
    "Public Administration-2024": ["24.B09-vshm", "24.B10-vshm"],
    "Public Administration-2022": ["22.B10-vshm", "22.B11-vshm"],
    // Master's degree programs
    "Management-2023-master": ["23.M01-vshm"],
    "Management-2024-master": ["24.M01-vshm"],
    "Business Analytics and Big Data-2023-master": ["23.M04-vshm"],
    "Business Analytics and Big Data-2024-master": ["24.M04-vshm"],
    "Smart City Management-2023-master": ["23.M03-vshm"],
    "Smart City Management-2024-master": ["24.M03-vshm"],
    "Corporate Finance-2023-master": ["23.M02-vshm"],
    "Corporate Finance-2024-master": ["24.M02-vshm"],
  }

  return { programs, years, groups }
}

// Function to get a display name for a program code
export function getProgramDisplayName(programCode: string): string {
  return programCode // Already using display names
}

// Function to get a display name for a group
export function getGroupDisplayName(group: string): string {
  // Format the group name for display
  // e.g., "23.B12-vshm" -> "B12" or "23.Б12-вшм" -> "Б12"
  const parts = group.split("-")
  if (parts.length >= 1) {
    const programParts = parts[0].split(".")
    if (programParts.length >= 2) {
      return programParts[1]
    }
  }
  return group
}

// Function to get program code for slug - updated for database structure
function getProgramCode(program: string): string {
  // Convert program names to codes
  const programMap: Record<string, string> = {
    Management: "men",
    "International Management": "mmen",
    "Public Administration": "gmu",
    "Business Analytics and Big Data": "babd",
    "Smart City Management": "scm",
    "Corporate Finance": "cfin",
  }

  return programMap[program] || "prog"
}

// Function to get degree code for slug
function getDegreeCode(degreeId: number): string {
  // 1 = Bachelor, 2 = Master (based on our seed data)
  return degreeId === 2 ? "mag" : "bak"
}

// Function to generate a slug for the URL - updated for database structure
export function generateSlug(programCode: string, year: string, groupFullCode: string, degreeId: number): string {
  // Extract the year prefix (e.g., 2023 -> 23)
  const yearPrefix = year.substring(2)

  // Extract the group code from full_code (e.g., "23.B12-vshm" -> "b12")
  const groupCode = getGroupDisplayName(groupFullCode).toLowerCase()

  // Get program code for the slug
  const programSlugCode = getProgramCode(programCode)

  // Get degree code for the slug
  const degreeCode = getDegreeCode(degreeId)

  // Generate the slug (e.g., bak-men-24-b01 or mag-men-24-b01)
  return `${degreeCode}-${programSlugCode}-${yearPrefix}-${groupCode}`
}

// Function to parse a slug and extract program, year, and group - updated for database
export function parseSlug(
  slug: string,
): { program: string; year: string; groupPattern: string; programCode: string; degree: string } | null {
  // Expected format: degree-programcode-yy-group (e.g., bak-men-24-b01 or mag-mmen-23-b11)
  const parts = slug.split("-")
  if (parts.length >= 4) {
    const degreeCode = parts[0].toLowerCase()
    const programCode = parts[1].toLowerCase()
    const yearPrefix = parts[2]
    const groupCode = parts[3].toUpperCase()

    // Map program code to program name
    const programMap: Record<string, string> = {
      men: "Management",
      mmen: "International Management",
      gmu: "Public Administration",
      babd: "Business Analytics and Big Data",
      scm: "Smart City Management",
      cfin: "Corporate Finance",
    }

    const programName = programMap[programCode]
    if (!programName) {
      return null
    }

    // Determine degree from degreeCode
    const degree = degreeCode === "mag" ? "master" : "bachelor"

    // Always use vshm suffix for consistency with the data files
    const suffix = "vshm"

    return {
      program: programName,
      year: `20${yearPrefix}`,
      // Use vshm suffix for all groups to match the data files
      groupPattern: `${yearPrefix}.${groupCode}-${suffix}`,
      programCode: programCode,
      degree: degree,
    }
  }

  return null
}

// Function to get the schedule file path for a specific group and language
export function getScheduleFilePath(group: string, language = "en"): string {
  // Extract the group information to determine the file path
  const parts = group.split("-")
  if (parts.length >= 1) {
    const programParts = parts[0].split(".")
    if (programParts.length >= 2) {
      const yearPrefix = programParts[0]
      const groupCode = programParts[1].toLowerCase()

      // Return the appropriate file based on language
      if (language === "ru") {
        return `/data/ru-schedule-${yearPrefix}-${groupCode}.txt`
      } else {
        return `/data/schedule-${yearPrefix}-${groupCode}.txt`
      }
    }
  }

  // Default to the 23.B12 schedule in the requested language
  return language === "ru" ? "/data/ru-schedule-23-b12.txt" : "/data/schedule-23-b12.txt"
}
