import type { ScheduleEntry } from "./types"

export function parseScheduleData(data: string): ScheduleEntry[] {
  if (!data || data.trim() === "") return []

  // Split by lines and filter out empty lines in one pass
  const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "")

  if (lines.length === 0) return []

  const result: ScheduleEntry[] = []

  // Skip header if it exists
  const startIndex = lines[0].toLowerCase().includes("group") ? 1 : 0

  // Process all lines in a single loop with minimal operations
  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split("\t")

    // Skip if we don't have enough values
    if (values.length < 10 || !values[0] || !values[1]) continue

    // Parse date - optimize for the common case
    let dateStr = values[1]
    if (dateStr.includes("/")) {
      const dateParts = dateStr.split(" ")[0].split("/")
      if (dateParts.length === 3) {
        dateStr = `${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}-${dateParts[2].substring(2, 4)}`
      }
    } else {
      dateStr = dateStr.substring(0, 8)
    }

    // Create entry with minimal processing
    result.push({
      academicGroup: values[0].replace(/^"|"$/g, ""),
      date: dateStr,
      start: values[2].replace(/^"|"$/g, ""),
      end: values[3].replace(/^"|"$/g, ""),
      name: values[4].replace(/^"|"$/g, ""),
      discipline: values[5].replace(/^"|"$/g, ""),
      type: values[6].replace(/^"|"$/g, ""),
      address: values[7].replace(/^"|"$/g, ""),
      room: values[8].replace(/^"|"$/g, ""),
      teacher: values[9].replace(/^"|"$/g, ""),
    })
  }

  return result
}

// This is a new function to handle the schedule format for the UI
export async function parseSchedule(year: string, group: string, language = "en"): Promise<any> {
  const prefix = language === "ru" ? "ru-" : ""
  const fileName = `${prefix}schedule-${year}-${group}.txt`

  let fileContent = ""

  try {
    // Always fetch from API which will check Blob storage first
    const response = await fetch(`/api/schedule-file?file=${fileName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule file: ${response.statusText}`)
    }
    fileContent = await response.text()
  } catch (error) {
    console.error(`Error fetching schedule file ${fileName}:`, error)
    return { entries: [], dates: [] }
  }

  const lines = fileContent.split("\n").filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    return { entries: [], dates: [] }
  }

  // The first line contains the dates
  const dates = lines[0].split("\t").slice(1)

  // The rest of the lines contain the schedule entries
  const entries: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("\t")
    const time = parts[0]

    for (let j = 1; j < parts.length; j++) {
      if (parts[j] && parts[j].trim() !== "") {
        entries.push({
          time,
          date: dates[j - 1],
          description: parts[j],
        })
      }
    }
  }

  return { entries, dates }
}
