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
