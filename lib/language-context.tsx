"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"

interface LanguageContextType {
  language: "en" | "ru"
  setLanguage: (language: "en" | "ru") => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

type TranslationDictionary = {
  [key: string]: string
}

type Translations = {
  en: TranslationDictionary
  ru: TranslationDictionary
}

const LANGUAGE_STORAGE_KEY = "gsom-timetable-language"

const translations: Translations = {
  en: {
    "home.title": "GSOM Timetable",
    "home.subtitle": "Select your degree, program, year and group",
    "timetable.program": "Timetable",
    "timetable.group": "Group",
    "timetable.return": "Return to Selection",
    "timetable.thisWeek": "This Week",
    "timetable.noClasses": "No classes scheduled for this day.",
    "language.switch": "Switch Language",
    "room.label": "Room",
    "footer.feedback": "Found a mistake or want to suggest an improvement?",
    "footer.gsomStudent": "Developed by a GSOM Student",
    "footer.telegramMessage": "Send a message via Telegram",
    "programs.internationalManagement": "International Management",
    "programs.management": "Management",
    "programs.publicAdministration": "Public Administration",
    "programs.businessAnalytics": "Business Analytics and Big Data",
    "programs.smartCityManagement": "Smart City Management",
    "programs.corporateFinance": "Corporate Finance",
    "degree.bachelor": "Bachelor's",
    "degree.master": "Master's",
    "year.enrollment": "Year of Enrollment",
  },
  ru: {
    "home.title": "Расписание ВШМ",
    "home.subtitle": "Выберите степень, программу, год и группу",
    "timetable.program": "Расписание",
    "timetable.group": "Группа",
    "timetable.return": "Вернуться к выбору",
    "timetable.thisWeek": "Эта неделя",
    "timetable.noClasses": "В этот день занятий не запланировано.",
    "language.switch": "Сменить язык",
    "room.label": "Аудитория",
    "footer.feedback": "Нашли ошибку или хотите предложить улучшение?",
    "footer.gsomStudent": "Разработано студентом ВШМ",
    "footer.telegramMessage": "Отправить сообщение через Telegram",
    "programs.internationalManagement": "Международный менеджмент",
    "programs.management": "Менеджмент",
    "programs.publicAdministration": "Государственное и муниципальное управление",
    "programs.businessAnalytics": "Бизнес-аналитика и большие данные",
    "programs.smartCityManagement": "Управление умным городом",
    "programs.corporateFinance": "Корпоративные финансы",
    "degree.bachelor": "Бакалавриат",
    "degree.master": "Магистратура",
    "year.enrollment": "Год поступления",
  },
}

// Helper function to detect browser language
const detectBrowserLanguage = (): "en" | "ru" => {
  if (typeof window === "undefined") return "en" // Default for SSR

  const browserLang = navigator.language.toLowerCase().split("-")[0]
  return browserLang === "ru" ? "ru" : "en" // Default to English for any other language
}

// Helper function to get stored language preference
const getStoredLanguage = (): "en" | "ru" | null => {
  if (typeof window === "undefined") return null // Return null for SSR

  try {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return storedLang === "ru" ? "ru" : storedLang === "en" ? "en" : null
  } catch (error) {
    console.error("Error accessing localStorage:", error)
    return null
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize with a placeholder, will be updated in useEffect
  const [language, setLanguageState] = useState<"en" | "ru">("en")
  const [isInitialized, setIsInitialized] = useState(false)

  // Custom setter that also updates localStorage
  const setLanguage = useCallback((newLanguage: "en" | "ru") => {
    setLanguageState(newLanguage)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    } catch (error) {
      console.error("Error setting localStorage:", error)
    }
  }, [])

  // Initialize language based on stored preference or browser language
  useEffect(() => {
    if (!isInitialized) {
      const storedLang = getStoredLanguage()
      const initialLang = storedLang || detectBrowserLanguage()
      setLanguageState(initialLang)
      setIsInitialized(true)
    }
  }, [isInitialized])

  const t = useCallback(
    (key: string) => {
      const dict = translations[language] || translations.en
      return dict[key] || key
    },
    [language],
  )

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
