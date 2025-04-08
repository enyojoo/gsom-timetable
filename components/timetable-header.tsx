"use client"

import { useLanguage } from "@/lib/language-context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"

interface TimetableHeaderProps {
  program: string
  groupCode: string
  year: string // Added year prop
}

export function TimetableHeader({ program, groupCode, year }: TimetableHeaderProps) {
  const { language, t } = useLanguage()

  // Get the translated program name
  const getTranslatedProgram = (program: string) => {
    if (program === "International Management") {
      return t("programs.internationalManagement")
    } else if (program === "Management") {
      return t("programs.management")
    }
    return program
  }

  // Format the group code for display based on language
  const getFormattedGroupCode = (code: string) => {
    return language === "ru" ? code.replace(/B/g, "Б") : code
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-sm">
      {/* Single layout for all screen sizes */}
      <div className="flex flex-col items-center space-y-4">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={language === "en" ? "/images/gsom-logo.png" : "/images/gsom-logo-ru.png"}
            alt={language === "en" ? "GSOM Logo" : "Логотип ВШМ"}
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </div>

        {/* Program title and group */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {getTranslatedProgram(program)} {t("timetable.program")}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {language === "en" ? "Year of enrollment" : "Год поступления"}: {year}, {t("timetable.group")}:{" "}
            {getFormattedGroupCode(groupCode)}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center space-x-3 mt-2">
          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("timetable.return")}</span>
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}
