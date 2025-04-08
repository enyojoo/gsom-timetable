"use client"

import { useMemo, memo } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameMonth } from "date-fns"
import { ru } from "date-fns/locale"
import { Clock, MapPin, User, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ScheduleEntry } from "@/lib/types"
import { useLanguage } from "@/lib/language-context"
import { useState } from "react"

// Moscow time zone offset in hours (UTC+3)
const MOSCOW_TIMEZONE_OFFSET = 3

// Get current date in Moscow time zone - moved outside component for performance
const getCurrentMoscowDate = () => {
  const now = new Date()
  const localOffset = now.getTimezoneOffset()
  const moscowOffsetMinutes = MOSCOW_TIMEZONE_OFFSET * 60
  const totalOffsetMs = (localOffset + moscowOffsetMinutes) * 60 * 1000
  return new Date(now.getTime() + totalOffsetMs)
}

// Get current week start - moved outside component for performance
const getCurrentWeekStart = () => {
  const today = getCurrentMoscowDate()
  return startOfWeek(today, { weekStartsOn: 1 })
}

// Get class type badge color - moved outside component for performance
const getClassTypeColor = (type: string): string => {
  const lowerType = type.toLowerCase()
  if (lowerType.includes("лекция") || lowerType.includes("lecture")) return "bg-red-600"
  if (lowerType.includes("семинар") || lowerType.includes("seminar")) return "bg-red-700"
  if (lowerType.includes("практическое занятие") || lowerType.includes("practical lesson")) return "bg-red-500"
  if (lowerType.includes("групповая консультация") || lowerType.includes("group consultation")) return "bg-amber-600"
  if (lowerType.includes("зачет") || lowerType.includes("credit")) return "bg-red-800"
  if (lowerType.includes("показ работ") || lowerType.includes("display of works")) return "bg-red-400"
  return "bg-gray-500"
}

// Memoized class card component for better performance
const ClassCard = memo(
  ({
    entry,
    language,
    t,
  }: {
    entry: ScheduleEntry
    language: string
    t: (key: string) => string
  }) => (
    <div className="p-3 border rounded-md hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-1 mb-2">
        <Badge className={cn("text-white", getClassTypeColor(entry.type))}>{entry.type}</Badge>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {entry.start.substring(0, 5)} - {entry.end.substring(0, 5)}
          </span>
        </div>
      </div>

      <h3 className="font-medium mb-2">{entry.discipline}</h3>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          {language === "ru" ? t("room.label") : "Room"} {entry.room}
        </span>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
        <User className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{entry.teacher.split(",")[0]}</span>
      </div>
    </div>
  ),
)

// Memoized day card component for better performance
const DayCard = memo(
  ({
    date,
    entries,
    language,
    t,
    formatDate,
  }: {
    date: Date
    entries: ScheduleEntry[]
    language: string
    t: (key: string) => string
    formatDate: (date: Date, format: string) => string
  }) => {
    const dateStr = format(date, "dd-MM-yy")

    return (
      <Card key={dateStr} className={entries.length === 0 ? "opacity-70" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <div className={`${language === "ru" ? "w-40" : "w-32"} font-bold`}>{formatDate(date, "EEEE")}</div>
            <div className="text-sm font-normal ml-4 flex-shrink-0">{formatDate(date, "MMM d")}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {entries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {entries.map((entry, index) => (
                <ClassCard key={index} entry={entry} language={language} t={t} />
              ))}
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-muted-foreground">
              {t("timetable.noClasses")}
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

// Update the TimetableProps interface to include the academicGroup filter
interface TimetableProps {
  scheduleData: ScheduleEntry[]
  academicGroup?: string
}

// Main timetable component - memoized for performance
export const Timetable = memo(function Timetable({ scheduleData, academicGroup }: TimetableProps) {
  // Get language context
  const { language, t } = useLanguage()

  // Initialize with current week start - only once
  const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart)

  // Filter the schedule data by academic group if provided - memoized
  const filteredData = useMemo(() => {
    if (!academicGroup) return scheduleData
    return scheduleData.filter((entry) => entry.academicGroup === academicGroup)
  }, [scheduleData, academicGroup])

  // Format date with the correct locale - memoized function
  const formatDate = useMemo(() => {
    return (date: Date, formatStr: string) => format(date, formatStr, { locale: language === "ru" ? ru : undefined })
  }, [language])

  // Calculate current week dates - memoized
  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 6; i++) {
      dates.push(addDays(currentWeekStart, i))
    }
    return dates
  }, [currentWeekStart])

  // Format date range for the week - memoized
  const formattedDateRange = useMemo(() => {
    const weekStart = currentWeekStart
    const weekEnd = addDays(weekStart, 5) // Show Monday to Saturday (6 days)

    // Check if start and end dates are in the same month
    if (isSameMonth(weekStart, weekEnd)) {
      return `${formatDate(weekStart, "MMM d")} - ${formatDate(weekEnd, "d, yyyy")}`
    } else {
      return `${formatDate(weekStart, "MMM d")} - ${formatDate(weekEnd, "MMM d, yyyy")}`
    }
  }, [currentWeekStart, formatDate])

  // Group and sort data by date - memoized
  const sortedGroupedByDate = useMemo(() => {
    // Create a map for faster lookups
    const dateMap: Record<string, ScheduleEntry[]> = {}

    // Group entries by date
    filteredData.forEach((entry) => {
      if (!dateMap[entry.date]) {
        dateMap[entry.date] = []
      }
      dateMap[entry.date].push(entry)
    })

    // Sort entries by start time
    Object.keys(dateMap).forEach((date) => {
      dateMap[date].sort((a, b) => a.start.localeCompare(b.start))
    })

    return dateMap
  }, [filteredData])

  // Navigation functions
  const goToPreviousWeek = () => setCurrentWeekStart((prevDate) => subWeeks(prevDate, 1))
  const goToNextWeek = () => setCurrentWeekStart((prevDate) => addWeeks(prevDate, 1))
  const goToCurrentWeek = () => setCurrentWeekStart(getCurrentWeekStart())

  // If no data is available, show a message
  if (filteredData.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            {language === "ru" ? "Расписание не найдено" : "No Schedule Found"}
          </h3>
          <p className="text-gray-600">
            {language === "ru"
              ? "Расписание для выбранной группы пока не доступно. Хотите добавить или обновить расписание? Свяжитесь через Telegram по ссылке ниже."
              : "The schedule for the selected group is not available yet. Would you like to add or update the schedule? Contact via Telegram below."}
          </p>
        </div>
      </div>
    )
  }

  // Get entries for each date
  const getEntriesForDate = (date: Date) => {
    const dateStr = format(date, "dd-MM-yy")
    return sortedGroupedByDate[dateStr] || []
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{formattedDateRange}</span>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
          {t("timetable.thisWeek")}
        </Button>
      </div>

      <div className="space-y-4">
        {weekDates.map((date) => (
          <DayCard
            key={format(date, "yyyy-MM-dd")}
            date={date}
            entries={getEntriesForDate(date)}
            language={language}
            t={t}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  )
})
