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
  const { language } = useLanguage()

  // State for all data from database
  const [degrees, setDegrees] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [years, setYears] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])

  // Selected values
  const [selectedDegree, setSelectedDegree] = useState<any | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")

  // Loading states
  const [isLoadingDegrees, setIsLoadingDegrees] = useState(true)
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  // Fetch degrees on component mount
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        setIsLoadingDegrees(true)
        console.log("Fetching degrees...")

        const response = await fetch("/api/timetable-data?type=degrees")
        const data = await response.json()

        console.log("Degrees response:", data)

        if (data.success && data.data.length > 0) {
          setDegrees(data.data)
          // Auto-select first degree
          setSelectedDegree(data.data[0])
        } else {
          console.error("No degrees found:", data)
        }
      } catch (error) {
        console.error("Error fetching degrees:", error)
      } finally {
        setIsLoadingDegrees(false)
      }
    }

    fetchDegrees()
  }, [])

  // Fetch programs when degree changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedDegree?.id) {
        setPrograms([])
        setSelectedProgram(null)
        return
      }

      try {
        setIsLoadingPrograms(true)
        console.log("Fetching programs for degree:", selectedDegree.id)

        const response = await fetch(`/api/timetable-data?type=programs&degreeId=${selectedDegree.id}`)
        const data = await response.json()

        console.log("Programs response:", data)

        if (data.success) {
          setPrograms(data.data)
          // Reset dependent selections
          setSelectedProgram(null)
          setSelectedYear("")
          setSelectedGroup("")
          setYears([])
          setGroups([])

          // Auto-select first program
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
      if (!selectedProgram?.id) {
        setYears([])
        setSelectedYear("")
        return
      }

      try {
        setIsLoadingYears(true)
        console.log("Fetching years for program:", selectedProgram.id)

        const response = await fetch(`/api/timetable-data?type=years&programId=${selectedProgram.id}`)
        const data = await response.json()

        console.log("Years response:", data)

        if (data.success) {
          setYears(data.data)
          // Reset dependent selections
          setSelectedYear("")
          setSelectedGroup("")
          setGroups([])

          // Auto-select most recent year
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
      if (!selectedProgram?.id || !selectedYear) {
        setGroups([])
        setSelectedGroup("")
        return
      }

      try {
        setIsLoadingGroups(true)
        console.log("Fetching groups for program:", selectedProgram.id, "year:", selectedYear)

        const response = await fetch(
          `/api/timetable-data?type=groups&programId=${selectedProgram.id}&year=${selectedYear}`,
        )
        const data = await response.json()

        console.log("Groups response:", data)

        if (data.success) {
          setGroups(data.data)
          // Reset group selection
          setSelectedGroup("")

          // Auto-select first group
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
    if (selectedProgram && selectedYear && selectedGroup && selectedDegree) {
      console.log("Generating slug with:", {
        programCode: selectedProgram.code,
        year: selectedYear,
        groupFullCode: selectedGroup,
        degreeCode: selectedDegree.code,
      })

      const slug = generateSlug(selectedProgram.code, selectedYear, selectedGroup, selectedDegree.code)
      console.log("Generated slug:", slug)
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
            disabled={isLoadingDegrees}
          >
            {isLoadingDegrees ? (
              <option value="">{language === "en" ? "Loading degrees..." : "Загрузка степеней..."}</option>
            ) : degrees.length === 0 ? (
              <option value="">{language === "en" ? "No degrees available" : "Нет доступных степеней"}</option>
            ) : (
              degrees.map((degree) => (
                <option key={degree.id} value={degree.id}>
                  {getDegreeName(degree)}
                </option>
              ))
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
            disabled={isLoadingPrograms || !selectedDegree}
          >
            {isLoadingPrograms ? (
              <option value="">{language === "en" ? "Loading programs..." : "Загрузка программ..."}</option>
            ) : programs.length === 0 ? (
              <option value="">{language === "en" ? "No programs available" : "Нет доступных программ"}</option>
            ) : (
              programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {getProgramName(program)}
                </option>
              ))
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
            disabled={isLoadingYears || !selectedProgram}
          >
            {isLoadingYears ? (
              <option value="">{language === "en" ? "Loading years..." : "Загрузка годов..."}</option>
            ) : years.length === 0 ? (
              <option value="">{language === "en" ? "No years available" : "Нет доступных годов"}</option>
            ) : (
              years.map((yearData) => (
                <option key={yearData.year} value={yearData.year}>
                  {yearData.year}
                </option>
              ))
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
            disabled={isLoadingGroups || !selectedYear}
          >
            {isLoadingGroups ? (
              <option value="">{language === "en" ? "Loading groups..." : "Загрузка групп..."}</option>
            ) : groups.length === 0 ? (
              <option value="">{language === "en" ? "No groups available" : "Нет доступных групп"}</option>
            ) : (
              groups.map((group) => (
                <option key={group.id} value={group.full_code}>
                  {getGroupName(group)}
                </option>
              ))
            )}
          </select>
        </div>

        {/* View Timetable Button */}
        <Button
          className="mt-6 w-full"
          onClick={handleViewTimetable}
          disabled={!selectedProgram || !selectedYear || !selectedGroup || !selectedDegree}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {language === "en" ? "View Timetable" : "Посмотреть расписание"}
        </Button>
      </div>
    </div>
  )
}
