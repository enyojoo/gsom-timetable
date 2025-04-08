"use client"

import { memo } from "react"
import { Timetable } from "@/components/timetable"
import { useLanguage } from "@/lib/language-context"
import type { ScheduleEntry } from "@/lib/types"

interface LanguageAwareTimetableProps {
  englishScheduleData: ScheduleEntry[]
  russianScheduleData: ScheduleEntry[]
  academicGroup?: string
}

// Use memo to prevent unnecessary re-renders
export const LanguageAwareTimetable = memo(function LanguageAwareTimetable({
  englishScheduleData,
  russianScheduleData,
  academicGroup,
}: LanguageAwareTimetableProps) {
  const { language } = useLanguage()

  // Directly use the correct data based on language - no state or effects
  const scheduleData = language === "ru" ? russianScheduleData : englishScheduleData

  // Directly map the group - no state or effects
  const mappedGroup =
    language === "ru" && academicGroup ? academicGroup.replace(/B/g, "Б").replace(/vshm/g, "вшм") : academicGroup

  // Render the timetable directly - no conditional rendering or loading states
  return <Timetable scheduleData={scheduleData} academicGroup={mappedGroup} />
})
