"use client"

import { useLanguage } from "@/lib/language-context"
import { Timetable } from "./timetable"
import type { ScheduleEntry } from "@/lib/types"

interface GroupInfo {
  degree: string
  degreeRu: string
  program: string
  programRu: string
  year: string
  group: string
  groupRu: string
  fullCode: string
}

interface LanguageAwareTimetableProps {
  scheduleData: ScheduleEntry[]
  groupInfo: GroupInfo
}

export function LanguageAwareTimetable({ scheduleData, groupInfo }: LanguageAwareTimetableProps) {
  const { language } = useLanguage()

  // Convert the schedule data to the format expected by the Timetable component
  const convertedScheduleData = scheduleData.map((entry) => ({
    date: entry.date,
    start: entry.time,
    end: entry.endTime,
    discipline: language === "ru" ? entry.subjectRu : entry.subject,
    type: language === "ru" ? entry.typeRu : entry.type,
    teacher: language === "ru" ? entry.teacherRu : entry.teacher,
    room: entry.room,
    address: language === "ru" ? entry.addressRu : entry.address,
    academicGroup: groupInfo.fullCode,
  }))

  return (
    <div className="space-y-6">
      {/* Header with group information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">{language === "ru" ? groupInfo.programRu : groupInfo.program}</h1>
        <div className="text-gray-600 space-y-1">
          <p>
            {language === "ru" ? "Степень" : "Degree"}: {language === "ru" ? groupInfo.degreeRu : groupInfo.degree}
          </p>
          <p>
            {language === "ru" ? "Год поступления" : "Year of Enrollment"}: {groupInfo.year}
          </p>
          <p>
            {language === "ru" ? "Группа" : "Group"}: {language === "ru" ? groupInfo.groupRu : groupInfo.group} (
            {groupInfo.fullCode})
          </p>
        </div>
      </div>

      {/* Timetable */}
      <Timetable scheduleData={convertedScheduleData} academicGroup={groupInfo.fullCode} />
    </div>
  )
}
