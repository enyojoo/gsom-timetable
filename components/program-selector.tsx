"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import { generateSlug } from "@/lib/program-utils"

interface Degree {
  id: number
  code: string
  name_en: string
  name_ru: string
}

interface Program {
  id: number
  code: string
  name_en: string
  name_ru: string
  degree_id: number
}

interface Year {
  year: number
}

interface Group {
  id: number
  code: string
  name_en: string
  name_ru: string
  full_code: string
  year: number
}

export function ProgramSelector() {
  const { language, t } = useLanguage()
  const router = useRouter()

  // State for form data
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  // State for dropdown options
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  // Loading states
  const [loadingDegrees, setLoadingDegrees] = useState(true)
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Fetch degrees on component mount
  useEffect(() => {
    fetchDegrees()
  }, [])

  const fetchDegrees = async () => {
    try {
      setLoadingDegrees(true)
      console.log("Fetching degrees...")

      const response = await fetch("/api/timetable-data?type=degrees")
      const result = await response.json()

      console.log("Degrees API response:", result)

      if (result.success && result.data) {
        setDegrees(result.data)
        console.log("Degrees loaded:", result.data.length)
      } else {
        console.error("Failed to fetch degrees:", result.error)
        setDegrees([])
      }
    } catch (error) {
      console.error("Error fetching degrees:", error)
      setDegrees([])
    } finally {
      setLoadingDegrees(false)
    }
  }

  const fetchPrograms = async (degreeId: number) => {
    try {
      setLoadingPrograms(true)
      console.log("Fetching programs for degree:", degreeId)

      const response = await fetch(`/api/timetable-data?type=programs&degreeId=${degreeId}`)
      const result = await response.json()

      console.log("Programs API response:", result)

      if (result.success && result.data) {
        setPrograms(result.data)
        console.log("Programs loaded:", result.data.length)
      } else {
        console.error("Failed to fetch programs:", result.error)
        setPrograms([])
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
      setPrograms([])
    } finally {
      setLoadingPrograms(false)
    }
  }

  const fetchYears = async (programId: number) => {
    try {
      setLoadingYears(true)
      console.log("Fetching years for program:", programId)

      const response = await fetch(`/api/timetable-data?type=years&programId=${programId}`)
      const result = await response.json()

      console.log("Years API response:", result)

      if (result.success && result.data) {
        setYears(result.data)
        console.log("Years loaded:", result.data.length)
      } else {
        console.error("Failed to fetch years:", result.error)
        setYears([])
      }
    } catch (error) {
      console.error("Error fetching years:", error)
      setYears([])
    } finally {
      setLoadingYears(false)
    }
  }

  const fetchGroups = async (programId: number, year: number) => {
    try {
      setLoadingGroups(true)
      console.log("Fetching groups for program:", programId, "year:", year)

      const response = await fetch(`/api/timetable-data?type=groups&programId=${programId}&year=${year}`)
      const result = await response.json()

      console.log("Groups API response:", result)

      if (result.success && result.data) {
        setGroups(result.data)
        console.log("Groups loaded:", result.data.length)
      } else {
        console.error("Failed to fetch groups:", result.error)
        setGroups([])
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
      setGroups([])
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleDegreeChange = (degreeId: string) => {
    const degree = degrees.find((d) => d.id.toString() === degreeId)
    if (degree) {
      console.log("Degree selected:", degree)
      setSelectedDegree(degree)
      setSelectedProgram(null)
      setSelectedYear(null)
      setSelectedGroup(null)
      setPrograms([])
      setYears([])
      setGroups([])
      fetchPrograms(degree.id)
    }
  }

  const handleProgramChange = (programId: string) => {
    const program = programs.find((p) => p.id.toString() === programId)
    if (program) {
      console.log("Program selected:", program)
      setSelectedProgram(program)
      setSelectedYear(null)
      setSelectedGroup(null)
      setYears([])
      setGroups([])
      fetchYears(program.id)
    }
  }

  const handleYearChange = (year: string) => {
    const yearNum = Number.parseInt(year)
    console.log("Year selected:", yearNum)
    setSelectedYear(yearNum)
    setSelectedGroup(null)
    setGroups([])
    if (selectedProgram) {
      fetchGroups(selectedProgram.id, yearNum)
    }
  }

  const handleGroupChange = (groupId: string) => {
    const group = groups.find((g) => g.id.toString() === groupId)
    if (group) {
      console.log("Group selected:", group)
      setSelectedGroup(group)
    }
  }

  const handleViewTimetable = () => {
    if (selectedDegree && selectedProgram && selectedYear && selectedGroup) {
      console.log("Generating slug with:", {
        programCode: selectedProgram.code,
        year: selectedYear.toString(),
        groupFullCode: selectedGroup.full_code,
        degreeCode: selectedDegree.code,
      })

      const slug = generateSlug(
        selectedProgram.code,
        selectedYear.toString(),
        selectedGroup.full_code,
        selectedDegree.code,
      )

      console.log("Generated slug:", slug)
      router.push(`/${slug}`)
    }
  }

  const isViewButtonEnabled = selectedDegree && selectedProgram && selectedYear && selectedGroup

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {language === "ru" ? "Выберите вашу программу" : "Select Your Program"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Degree Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{language === "ru" ? "Степень" : "Degree"}</label>
          <Select onValueChange={handleDegreeChange} disabled={loadingDegrees}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingDegrees
                    ? language === "ru"
                      ? "Загрузка..."
                      : "Loading..."
                    : degrees.length === 0
                      ? language === "ru"
                        ? "Нет доступных степеней"
                        : "No degrees available"
                      : language === "ru"
                        ? "Выберите степень"
                        : "Select degree"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {degrees.map((degree) => (
                <SelectItem key={degree.id} value={degree.id.toString()}>
                  {language === "ru" ? degree.name_ru : degree.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{language === "ru" ? "Программа" : "Program"}</label>
          <Select onValueChange={handleProgramChange} disabled={!selectedDegree || loadingPrograms}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedDegree
                    ? language === "ru"
                      ? "Сначала выберите степень"
                      : "Select degree first"
                    : loadingPrograms
                      ? language === "ru"
                        ? "Загрузка..."
                        : "Loading..."
                      : programs.length === 0
                        ? language === "ru"
                          ? "Нет доступных программ"
                          : "No programs available"
                        : language === "ru"
                          ? "Выберите программу"
                          : "Select program"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id.toString()}>
                  {language === "ru" ? program.name_ru : program.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{language === "ru" ? "Год поступления" : "Year of Enrollment"}</label>
          <Select onValueChange={handleYearChange} disabled={!selectedProgram || loadingYears}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedProgram
                    ? language === "ru"
                      ? "Сначала выберите программу"
                      : "Select program first"
                    : loadingYears
                      ? language === "ru"
                        ? "Загрузка..."
                        : "Loading..."
                      : years.length === 0
                        ? language === "ru"
                          ? "Нет доступных годов"
                          : "No years available"
                        : language === "ru"
                          ? "Выберите год"
                          : "Select year"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.year} value={year.year.toString()}>
                  {year.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{language === "ru" ? "Группа" : "Group"}</label>
          <Select onValueChange={handleGroupChange} disabled={!selectedYear || loadingGroups}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedYear
                    ? language === "ru"
                      ? "Сначала выберите год"
                      : "Select year first"
                    : loadingGroups
                      ? language === "ru"
                        ? "Загрузка..."
                        : "Loading..."
                      : groups.length === 0
                        ? language === "ru"
                          ? "Нет доступных групп"
                          : "No groups available"
                        : language === "ru"
                          ? "Выберите группу"
                          : "Select group"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {language === "ru" ? group.name_ru : group.name_en} ({group.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Timetable Button */}
        <Button onClick={handleViewTimetable} disabled={!isViewButtonEnabled} className="w-full mt-6" size="lg">
          {language === "ru" ? "Посмотреть расписание" : "View Timetable"}
        </Button>
      </CardContent>
    </Card>
  )
}
