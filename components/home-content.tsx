"use client"

import { ProgramSelector } from "@/components/program-selector"
import Image from "next/image"
import { Suspense } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import { LanguageMeta } from "@/components/language-meta"

interface HomeContentProps {
  programs: string[]
  years: string[]
  groups: Record<string, string[]>
}

export function HomeContent({ programs, years, groups }: HomeContentProps) {
  const { language, t } = useLanguage()

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <LanguageMeta />
      <div className="flex justify-end w-full mb-4">
        <LanguageSwitcher />
      </div>
      <div className="mb-4">
        <Image
          src={language === "en" ? "/images/gsom-logo.png" : "/images/gsom-logo-ru.png"}
          alt={language === "en" ? "Graduate School of Management" : "Высшая школа менеджмента"}
          width={100}
          height={100}
          className="h-20 w-auto"
        />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">{t("home.title")}</h2>
        <p className="text-sm text-gray-600 mt-2">{t("home.subtitle")}</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProgramSelector programs={programs} years={years} groups={groups} />
      </Suspense>
    </div>
  )
}
