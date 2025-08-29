"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { generateSlug } from "@/lib/program-utils"

interface Degree {
  id: number
  name_en: string
  name_ru: string
  code: string
}

interface Program {
  id: number
  name_en: string
  name_ru: string
  code: string
}

interface Year {
  year: number
}

interface Group {
  id: number
  code: string
  full_code: string
  name_en: string
  name_ru: string
  year: number
}

export function ProgramSelector() {
  const { language } = useLanguage()
  const router = useRouter()

  const [degrees, setDegrees] = useState<Degree[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [years, setYears] = useState<Year[]>([])
  const [groups, setGroups] = useState<Group[]>([])

  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const [isLoadingDegrees, setIsLoadingDegrees] = useState(true)
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)
  const [isLoadingYears, setIsLoadingYears] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  // Load degrees on component mount
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const response = await fetch("/api/timetable-data?type=degrees")
        const data = await response.json()
        if (data.success) {
          setDegrees(data.data)
        } else {
          console.error("Failed to fetch degrees:", data.error)
        }
      } catch (error) {
        console.error("Error fetching degrees:", error)
      } finally {
        setIsLoadingDegrees(false)
      }
    }

    fetchDegrees()
  }, [])

  // Load programs when degree is selected
  useEffect(() => {
    if (selectedDegree) {
      setIsLoadingPrograms(true)
      setPrograms([])
      setSelectedProgram(null)
      setYears([])
      setSelectedYear(null)
      setGroups([])
      setSelectedGroup(null)

      const fetchPrograms = async () => {
        try {
          const response = await fetch(`/api/timetable-data?type=programs&degreeId=${selectedDegree.id}`)
          const data = await response.json()
          if (data.success) {
            setPrograms(data.data)
          }
        } catch (error) {
          console.error("Error fetching programs:", error)
        } finally {
          setIsLoadingPrograms(false)
        }
      }

      fetchPrograms()
    }
  }, [selectedDegree])

  // Load years when program is selected
  useEffect(() => {
    if (selectedProgram) {
      setIsLoadingYears(true)
      setYears([])
      setSelectedYear(null)
      setGroups([])
      setSelectedGroup(null)

      const fetchYears = async () => {
        try {
          const response = await fetch(`/api/timetable-data?type=years&programId=${selectedProgram.id}`)
          const data = await response.json()
          if (data.success) {
            setYears(data.data)
          }
        } catch (error) {
          console.error("Error fetching years:", error)
        } finally {
          setIsLoadingYears(false)
        }
      }

      fetchYears()
    }
  }, [selectedProgram])

  // Load groups when year is selected
  useEffect(() => {
    if (selectedProgram && selectedYear) {
      setIsLoadingGroups(true)
      setGroups([])
      setSelectedGroup(null)

      const fetchGroups = async () => {
        try {
          const response = await fetch(
            `/api/timetable-data?type=groups&programId=${selectedProgram.id}&year=${selectedYear}`,
          )
          const data = await response.json()
          if (data.success) {
            setGroups(data.data)
          }
        } catch (error) {
          console.error("Error fetching groups:", error)
        } finally {
          setIsLoadingGroups(false)
        }
      }

      fetchGroups()
    }
  }, [selectedProgram, selectedYear])

  const handleViewTimetable = () => {
    if (selectedDegree && selectedProgram && selectedYear && selectedGroup) {
      const slug = generateSlug(selectedDegree.code, selectedProgram.code, selectedYear, selectedGroup.code)
      console.log("Navigating to slug:", slug)
      console.log("Selected data:", {
        degree: selectedDegree,
        program: selectedProgram,
        year: selectedYear,
        group: selectedGroup,
      })
      router.push(`/${slug}`)
    }
  }

  const isViewEnabled = selectedDegree && selectedProgram && selectedYear && selectedGroup

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {language === "en" ? "Select Your Program" : "Выберите вашу программу"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Degree Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{language === "en" ? "Degree" : "Степень"}</label>
          <Select
            value={selectedDegree?.id.toString() || ""}
            onValueChange={(value) => {
              const degree = degrees.find((d) => d.id.toString() === value)
              setSelectedDegree(degree || null)
            }}
            disabled={isLoadingDegrees}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingDegrees
                    ? language === "en"
                      ? "Loading..."
                      : "Загрузка..."
                    : degrees.length === 0
                      ? language === "en"
                        ? "No degrees available"
                        : "Нет доступных степеней"
                      : language === "en"
                        ? "Select degree"
                        : "Выберите степень"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {degrees.map((degree) => (
                <SelectItem key={degree.id} value={degree.id.toString()}>
                  {language === "en" ? degree.name_en : degree.name_ru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">{language === "en" ? "Program" : "Программа"}</label>
          <Select
            value={selectedProgram?.id.toString() || ""}
            onValueChange={(value) => {
              const program = programs.find((p) => p.id.toString() === value)
              setSelectedProgram(program || null)
            }}
            disabled={!selectedDegree || isLoadingPrograms}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedDegree
                    ? language === "en"
                      ? "Select degree first"
                      : "Сначала выберите степень"
                    : isLoadingPrograms
                      ? language === "en"
                        ? "Loading..."
                        : "Загрузка..."
                      : programs.length === 0
                        ? language === "en"
                          ? "No programs available"
                          : "Нет доступных программ"
                        : language === "en"
                          ? "Select program"
                          : "Выберите программу"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id.toString()}>
                  {language === "en" ? program.name_en : program.name_ru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === "en" ? "Year of Enrollment" : "Год поступления"}
          </label>
          <Select
            value={selectedYear?.toString() || ""}
            onValueChange={(value) => {
              setSelectedYear(Number.parseInt(value))
            }}
            disabled={!selectedProgram || isLoadingYears}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedProgram
                    ? language === "en"
                      ? "Select program first"
                      : "Сначала выберите программу"
                    : isLoadingYears
                      ? language === "en"
                        ? "Loading..."
                        : "Загрузка..."
                      : years.length === 0
                        ? language === "en"
                          ? "No years available"
                          : "Нет доступных годов"
                        : language === "en"
                          ? "Select year"
                          : "Выберите год"
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
        <div>
          <label className="block text-sm font-medium mb-2">{language === "en" ? "Group" : "Группа"}</label>
          <Select
            value={selectedGroup?.id.toString() || ""}
            onValueChange={(value) => {
              const group = groups.find((g) => g.id.toString() === value)
              setSelectedGroup(group || null)
            }}
            disabled={!selectedYear || isLoadingGroups}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !selectedYear
                    ? language === "en"
                      ? "Select year first"
                      : "Сначала выберите год"
                    : isLoadingGroups
                      ? language === "en"
                        ? "Loading..."
                        : "Загрузка..."
                      : groups.length === 0
                        ? language === "en"
                          ? "No groups available"
                          : "Нет доступных групп"
                        : language === "en"
                          ? "Select group"
                          : "Выберите группу"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {language === "en" ? group.name_en : group.name_ru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Timetable Button */}
        <Button onClick={handleViewTimetable} disabled={!isViewEnabled} className="w-full mt-6">
          {language === "en" ? "View Timetable" : "Посмотреть расписание"}
        </Button>
      </CardContent>
    </Card>
  )
}
