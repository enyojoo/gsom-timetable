"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/program-utils"
import { useLanguage } from "@/lib/language-context"

interface ProgramSelectorProps {
  programs: string[]
  years: string[]
  groups: Record<string, string[]>
  defaultProgram?: string
  defaultYear?: string
  defaultGroup?: string
}

export function ProgramSelector({
  programs,
  years,
  groups,
  defaultProgram,
  defaultYear,
  defaultGroup,
}: ProgramSelectorProps) {
  const router = useRouter()
  const { t, language } = useLanguage()

  // Define degree types and their respective programs and years
  const degrees = [
    {
      id: "bachelor",
      nameEn: "Bachelor's",
      nameRu: "Бакалавриат",
      programs: ["Management", "International Management", "Public Administration"],
      years: ["2021", "2022", "2023", "2024"],
    },
    {
      id: "master",
      nameEn: "Master's",
      nameRu: "Магистратура",
      programs: ["Management", "Business Analytics and Big Data", "Smart City Management", "Corporate Finance"],
      years: ["2023", "2024"],
    },
  ]

  // Initialize with first values if available
  const [selectedDegree, setSelectedDegree] = useState(degrees[0])
  const [selectedProgram, setSelectedProgram] = useState<string>(
    defaultProgram || (selectedDegree.programs.length > 0 ? selectedDegree.programs[0] : ""),
  )
  const [selectedYear, setSelectedYear] = useState<string>(
    defaultYear || (selectedDegree.years.length > 0 ? selectedDegree.years[0] : ""),
  )
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup || "")
  const [availableGroups, setAvailableGroups] = useState<string[]>([])

  // Update available programs and years when degree changes
  useEffect(() => {
    if (selectedDegree) {
      // Set first program of the selected degree
      const firstProgram = selectedDegree.programs.length > 0 ? selectedDegree.programs[0] : ""
      setSelectedProgram(firstProgram)

      // Set first year of the selected degree
      const firstYear = selectedDegree.years.length > 0 ? selectedDegree.years[0] : ""
      setSelectedYear(firstYear)

      // Clear selected group when degree changes
      setSelectedGroup("")
    }
  }, [selectedDegree])

  // Update available groups when program or year changes
  useEffect(() => {
    if (selectedProgram && selectedYear) {
      // For Master's degree, use the master-specific groups
      if (selectedDegree.id === "master") {
        const key = `${selectedProgram}-${selectedYear}-master`
        const newAvailableGroups = groups[key] || []
        setAvailableGroups(newAvailableGroups)

        // Reset selected group if not available in the new selection
        if (selectedGroup && !newAvailableGroups.includes(selectedGroup)) {
          setSelectedGroup(newAvailableGroups.length > 0 ? newAvailableGroups[0] : "")
        } else if (!selectedGroup && newAvailableGroups.length > 0) {
          setSelectedGroup(newAvailableGroups[0])
        }
        return
      }

      // For Bachelor's Management, show groups for 2021, 2022, 2023 and 2024
      if (
        selectedDegree.id === "bachelor" &&
        selectedProgram === "Management" &&
        selectedYear !== "2021" &&
        selectedYear !== "2022" &&
        selectedYear !== "2023" &&
        selectedYear !== "2024"
      ) {
        setAvailableGroups([])
        setSelectedGroup("")
        return
      }

      // For International Management, show groups for 2021, 2022, 2023 and 2024
      if (
        selectedDegree.id === "bachelor" &&
        selectedProgram === "International Management" &&
        selectedYear !== "2021" &&
        selectedYear !== "2022" &&
        selectedYear !== "2023" &&
        selectedYear !== "2024"
      ) {
        setAvailableGroups([])
        setSelectedGroup("")
        return
      }

      // For Public Administration, show groups for 2021, 2022, 2023 and 2024
      if (
        selectedDegree.id === "bachelor" &&
        selectedProgram === "Public Administration" &&
        selectedYear !== "2021" &&
        selectedYear !== "2022" &&
        selectedYear !== "2023" &&
        selectedYear !== "2024"
      ) {
        setAvailableGroups([])
        setSelectedGroup("")
        return
      }

      // For other Bachelor's programs and years, use the existing groups data
      const key = `${selectedProgram}-${selectedYear}`
      const newAvailableGroups = groups[key] || []
      setAvailableGroups(newAvailableGroups)

      // Reset selected group if not available in the new selection
      if (selectedGroup && !newAvailableGroups.includes(selectedGroup)) {
        setSelectedGroup(newAvailableGroups.length > 0 ? newAvailableGroups[0] : "")
      } else if (!selectedGroup && newAvailableGroups.length > 0) {
        setSelectedGroup(newAvailableGroups[0])
      }
    }
  }, [selectedProgram, selectedYear, groups, selectedGroup, selectedDegree])

  const handleViewTimetable = () => {
    if (selectedProgram && selectedYear && selectedGroup) {
      const slug = generateSlug(selectedProgram, selectedYear, selectedGroup, selectedDegree.id)
      router.push(`/${slug}`)
    }
  }

  // Format group name for display (e.g., "23.B12-vshm" -> "B12" or "23.Б12-вшм" -> "Б12")
  const formatGroupName = (group: string): string => {
    const parts = group.split("-")
    if (parts.length >= 1) {
      const programParts = parts[0].split(".")
      if (programParts.length >= 2) {
        // Get the group code (B12, B01, etc.)
        let groupCode = programParts[1]

        // Convert B to Б if language is Russian
        if (language === "ru") {
          groupCode = groupCode.replace(/B/g, "Б").replace(/M/g, "М")
        }

        return groupCode
      }
    }
    return group
  }

  // Get translated program name
  const getTranslatedProgram = (program: string) => {
    if (program === "International Management") {
      return language === "en" ? "International Management" : "Международный менеджмент"
    } else if (program === "Management") {
      return language === "en" ? "Management" : "Менеджмент"
    } else if (program === "Public Administration") {
      return language === "en" ? "Public Administration" : "Государственное и муниципальное управление"
    } else if (program === "Business Analytics and Big Data") {
      return language === "en" ? "Business Analytics and Big Data" : "Бизнес-аналитика и большие данные"
    } else if (program === "Smart City Management") {
      return language === "en" ? "Smart City Management" : "Управление умным городом"
    } else if (program === "Corporate Finance") {
      return language === "en" ? "Corporate Finance" : "Корпоративные финансы"
    }
    return program
  }

  // Get degree name based on language
  const getDegreeName = (degree: (typeof degrees)[0]) => {
    return language === "en" ? degree.nameEn : degree.nameRu
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
            value={selectedDegree.id}
            onChange={(e) => {
              const degree = degrees.find((d) => d.id === e.target.value) || degrees[0]
              setSelectedDegree(degree)
            }}
          >
            {degrees.map((degree) => (
              <option key={degree.id} value={degree.id}>
                {getDegreeName(degree)}
              </option>
            ))}
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
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            {selectedDegree.programs.length === 0 ? (
              <option value="">{language === "en" ? "No programs available" : "Нет доступных программ"}</option>
            ) : (
              selectedDegree.programs.map((program) => (
                <option key={program} value={program}>
                  {getTranslatedProgram(program)}
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
          >
            {selectedDegree.years.length === 0 ? (
              <option value="">{language === "en" ? "No years available" : "Нет доступных годов"}</option>
            ) : (
              selectedDegree.years.map((year) => (
                <option key={year} value={year}>
                  {year}
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
            disabled={availableGroups.length === 0}
          >
            {availableGroups.length === 0 ? (
              <option value="">{language === "en" ? "No groups available" : "Нет доступных групп"}</option>
            ) : (
              availableGroups.map((group) => (
                <option key={group} value={group}>
                  {formatGroupName(group)}
                </option>
              ))
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
