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

// Function to get program code for slug
function getProgramCode(program: string): string {
  switch (program) {
    case "Management":
      return "men" // from Менеджмент
    case "International Management":
      return "mmen" // from Международный менеджмент
    case "Public Administration":
      return "gmu" // from Государственное и муниципальное управление
    case "Business Analytics and Big Data":
      return "babd" // from Бизнес-аналитика и большие данные
    case "Smart City Management":
      return "scm" // from Управление умным городом
    case "Corporate Finance":
      return "cfin" // from Корпоративные финансы
    default:
      return "prog"
  }
}

// Function to get degree code for slug
function getDegreeCode(degree: string): string {
  if (degree === "master") {
    return "mag" // from Магистратура
  }
  return "bak" // from Бакалавриат
}

// Function to generate a slug for the URL
export function generateSlug(program: string, year: string, group: string, degree = "bachelor"): string {
  // Extract the year prefix (e.g., 2023 -> 23)
  const yearPrefix = year.substring(2)

  // Extract the group code (e.g., 23.B12-vshm -> B12 or 23.Б12-вшм -> Б12)
  const groupCode = getGroupDisplayName(group).toLowerCase()

  // Get program code for the slug
  const programCode = getProgramCode(program)

  // Get degree code for the slug
  const degreeCode = getDegreeCode(degree)

  // Generate the slug (e.g., bak-men-24-b01 or mag-men-24-b01)
  return `${degreeCode}-${programCode}-${yearPrefix}-${groupCode}`
}

// Function to parse a slug and extract program, year, and group
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
    let programName = ""
    switch (programCode) {
      case "men":
        programName = "Management"
        break
      case "mmen":
        programName = "International Management"
        break
      case "gmu":
        programName = "Public Administration"
        break
      case "babd":
        programName = "Business Analytics and Big Data"
        break
      case "scm":
        programName = "Smart City Management"
        break
      case "cfin":
        programName = "Corporate Finance"
        break
      default:
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
