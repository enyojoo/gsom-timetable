import { getScheduleData } from "./api/schedule-data"
import { HomeContent } from "@/components/home-content"

export default async function Home() {
  // Get schedule data from server function
  const { programs, years, groups } = await getScheduleData()

  return (
    <main className="container mx-auto pt-2 pb-0 px-4">
      <div className="max-w-md mx-auto bg-white p-8 pb-4 rounded-lg shadow-sm mb-0">
        <HomeContent programs={programs} years={years} groups={groups} />
      </div>
    </main>
  )
}
