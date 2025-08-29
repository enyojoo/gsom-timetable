export interface ProgramInfo {
  degree: string
  program: string
  year: string
  group: string
  degreeCode: string
  programCode: string
  groupCode: string
  fullCode: string
}

export function parseSlug(slug: string): ProgramInfo | null {
  console.log("Parsing slug:", slug)

  // Expected format: bak-men-21-b01
  const parts = slug.split("-")

  if (parts.length !== 4) {
    console.log("Invalid slug format, expected 4 parts, got:", parts.length)
    return null
  }

  const [degreeCode, programCode, yearStr, groupCode] = parts

  // Convert year from 21 to 2021
  const year = yearStr.length === 2 ? `20${yearStr}` : yearStr

  // Build full_code format: 21.B01-vshm
  const fullCode = `${yearStr}.${groupCode.toUpperCase()}-vshm`

  console.log("Parsed slug:", {
    degreeCode,
    programCode,
    year,
    groupCode: groupCode.toUpperCase(),
    fullCode,
  })

  return {
    degree: degreeCode === "bak" ? "Bachelor's" : "Master's",
    program: programCode,
    year,
    group: groupCode.toUpperCase(),
    degreeCode,
    programCode,
    groupCode: groupCode.toUpperCase(),
    fullCode,
  }
}

export function generateSlug(degreeCode: string, programCode: string, year: number, groupCode: string): string {
  // Convert year from 2021 to 21
  const yearStr = year.toString().slice(-2)
  const slug = `${degreeCode}-${programCode}-${yearStr}-${groupCode.toLowerCase()}`
  console.log("Generated slug:", slug)
  return slug
}

export function formatProgramName(programInfo: ProgramInfo): string {
  return `${programInfo.degree} in ${programInfo.program} - ${programInfo.year} - Group ${programInfo.group}`
}
