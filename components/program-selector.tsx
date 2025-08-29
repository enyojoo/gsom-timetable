"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/program-utils"
import { useLanguage } from "@/lib/language-context"

interface ProgramSelectorProps {
  defaultProgram?: string
  defaultYear?: string
  defaultGroup?: string
}

export function ProgramSelector({ defaultProgram, defaultYear, defaultGroup }: ProgramSelectorProps) {
  const router = useRouter()
  const { t, language } = useLanguage()

  // Initialize states for degrees, programs, groups, and loading status
  const [degrees, setDegrees] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [years, setYears] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [selectedDegree, setSelectedDegree] = useState<any | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear || "")
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup || "")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  // Fetch initial degrees data
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch("/api/timetable-data?type=degrees")
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          setDegrees(data.data)
          // Set first degree as selected by default
          setSelectedDegree(data.data[0])
        } else {
          console.error("No degrees found or API error:", data)
        }
      } catch (error) {
        console.error("Error fetching degrees:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchDegrees()
  }, [])

  // Fetch programs when degree changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedDegree?.id) return

      try {
        setIsLoadingPrograms(true)
        const response = await fetch(`/api/timetable-data?type=programs&degreeId=${selectedDegree.id}`)
        const data = await response.json()

        if (data.success) {
          setPrograms(data.data)
          // Reset dependent selections
          setSelectedProgram(null)
          setSelectedYear("")
          setSelectedGroup("")
          setYears([])
          setGroups([])

          // Set first program as selected if available
          if (data.data.length > 0) {
            setSelectedProgram(data.data[0])
          }
        }
      } catch (error) {
        console.error("Error fetching programs:", error)
      } finally {
        setIsLoadingPrograms(false)
      }
    }

    fetchPrograms()
  }, [selectedDegree])

  // Fetch years when program changes
  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedProgram?.id) return

      try {
        setIsLoadingYears(true)
        const response = await fetch(`/api/timetable-data?type=years&programId=${selectedProgram.id}`)
        const data = await response.json()

        if (data.success) {
          setYears(data.data)
          // Reset dependent selections
          setSelectedYear("")
          setSelectedGroup("")
          setGroups([])

          // Set most recent year as selected if available
          if (data.data.length > 0) {
            setSelectedYear(data.data[0].year.toString())
          }
        }
      } catch (error) {
        console.error("Error fetching years:", error)
      } finally {
        setIsLoadingYears(false)
      }
    }

    fetchYears()
  }, [selectedProgram])

  // Fetch groups when program and year change
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedProgram?.id || !selectedYear) return

      try {
        setIsLoadingGroups(true)
        const response = await fetch(
          `/api/timetable-data?type=groups&programId=${selectedProgram.id}&year=${selectedYear}`,
        )
        const data = await response.json()

        if (data.success) {
          setGroups(data.data)
          // Reset group selection
          setSelectedGroup("")

          // Set first group as selected if available
          if (data.data.length > 0) {
            setSelectedGroup(data.data[0].full_code)
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error)
      } finally {
        setIsLoadingGroups(false)
      }
    }

    fetchGroups()
  }, [selectedProgram, selectedYear])

  const handleViewTimetable = () => {
    if (selectedProgram && selectedYear && selectedGroup) {
      const slug = generateSlug(selectedProgram.code, selectedYear, selectedGroup, selectedDegree?.id)
      router.push(`/${slug}`)
    }
  }

  // Get translated names based on language
  const getDegreeName = (degree: any) => {
    return language === "en" ? degree.name_en : degree.name_ru
  }

  const getProgramName = (program: any) => {
    return language === "en" ? program.name_en : program.name_ru
  }

  const getGroupName = (group: any) => {
    return language === "en" ? group.name_en : group.name_ru
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col space-y-4">
        {/* Degree Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="degree-selector" className="text-sm font-medium text-left">
            {language === "en" ? "Degree" : "Степень"}
          </label>
          <select
            id="degree-selector"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={selectedDegree?.id || ""}
            onChange={(e) => {
              const degree = degrees.find((d) => d.id === Number.parseInt(e.target.value))
              setSelectedDegree(degree || null)
            }}
            disabled={isLoadingData}
          >
            {isLoadingData ? (
              <option value="">{language === "en" ? "Loading..." : "Загрузка..."}</option>
            ) : degrees.length === 0 ? (
              <option value="">{language === "en" ? "No degrees available" : "Нет доступных степеней"}</option>
            ) : (
              <>
                <option value="">{language === "en" ? "Select degree" : "Выберите степень"}</option>
                {degrees.map((degree) => (
                  <option key={degree.id} value={degree.id}>
                    {getDegreeName(degree)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Program Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="program-selector" className="text-sm font-medium text-left">
            {language === "en" ? "Program" : "Программа"}
          </label>
          <select
            id="program-selector"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={selectedProgram?.id || ""}
            onChange={(e) => {
              const program = programs.find((p) => p.id === Number.parseInt(e.target.value))
              setSelectedProgram(program || null)
            }}
            disabled={isLoadingPrograms || !selectedDegree || programs.length === 0}
          >
            {isLoadingPrograms ? (
              <option value="">{language === "en" ? "Loading..." : "Загрузка..."}</option>
            ) : programs.length === 0 ? (
              <option value="">{language === "en" ? "No programs available" : "Нет доступных программ"}</option>
            ) : (
              <>
                <option value="">{language === "en" ? "Select program" : "Выберите программу"}</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {getProgramName(program)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="year-selector" className="text-sm font-medium text-left">
            {language === "en" ? "Year of Enrollment" : "Год поступления"}
          </label>
          <select
            id="year-selector"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={isLoadingYears || !selectedProgram || years.length === 0}
          >
            {isLoadingYears ? (
              <option value="">{language === "en" ? "Loading..." : "Загрузка..."}</option>
            ) : years.length === 0 ? (
              <option value="">{language === "en" ? "No years available" : "Нет доступных годов"}</option>
            ) : (
              <>
                <option value="">{language === "en" ? "Select year" : "Выберите год"}</option>
                {years.map((yearData) => (
                  <option key={yearData.year} value={yearData.year}>
                    {yearData.year}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Group Selector */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="group-selector" className="text-sm font-medium text-left">
            {language === "en" ? "Group" : "Группа"}
          </label>
          <select
            id="group-selector"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isLoadingGroups || !selectedYear || groups.length === 0}
          >
            {isLoadingGroups ? (
              <option value="">{language === "en" ? "Loading..." : "Загрузка..."}</option>
            ) : groups.length === 0 ? (
              <option value="">{language === "en" ? "No groups available" : "Нет доступных групп"}</option>
            ) : (
              <>
                <option value="">{language === "en" ? "Select group" : "Выберите группу"}</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.full_code}>
                    {getGroupName(group)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* View Timetable Button */}
        <Button
          className="mt-6 w-full"
          onClick={handleViewTimetable}
          disabled={!selectedProgram || !selectedYear || !selectedGroup}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {language === "en" ? "View Timetable" : "Посмотреть расписание"}
        </Button>
      </div>
    </div>
  )
}
