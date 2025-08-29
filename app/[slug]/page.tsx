import { parseSlug } from "@/lib/program-utils"
import { redirect } from "next/navigation"
import { LanguageAwareTimetable } from "@/components/language-aware-timetable"
import { TimetableHeader } from "@/components/timetable-header"
import { LanguageMeta } from "@/components/language-meta"
import { getScheduleFiles } from "../api/schedule-data"
import { unstable_cache } from "next/cache"

interface TimetablePageProps {
  params: {
    slug: string
  }
}

// Cache the schedule data with a short TTL
const getCachedScheduleFiles = unstable_cache(
  async (groupPattern: string) => {
    return await getScheduleFiles(groupPattern)
  },
  ["schedule-files"],
  { revalidate: 60 }, // Revalidate every 60 seconds
)

export default async function TimetablePage({ params }: TimetablePageProps) {
  const { slug } = params

  // Parse the slug to get program, year, and group pattern
  const slugInfo = parseSlug(slug)
  if (!slugInfo) {
    // Redirect to home page if slug format is not valid
    redirect("/")
  }

  try {
    // Get schedule data from server function, passing the group pattern
    const { englishParsedData, russianParsedData } = await getCachedScheduleFiles(slugInfo.groupPattern)

    // Use the group pattern from the slug info
    const groupToUse = slugInfo.groupPattern

    // Extract the group code for display (e.g., B12)
    const groupCode = slugInfo.groupPattern.split("-")[0].split(".")[1]

    return (
      <main className="container mx-auto pt-6 pb-0 px-4">
        <LanguageMeta />
        <TimetableHeader
          program={slugInfo.program}
          groupCode={groupCode}
          year={slugInfo.year} // Pass the year from slugInfo
        />
        <div className="mb-0">
          <LanguageAwareTimetable
            englishScheduleData={englishParsedData}
            russianScheduleData={russianParsedData}
            academicGroup={groupToUse}
          />
        </div>
      </main>
    )
  } catch (error) {
    // If there's an error loading the schedule data, redirect to home page
    console.error("Error loading schedule data:", error)
    redirect("/")
  }
}
