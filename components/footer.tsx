"use client"

import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export function Footer() {
  const { t, language } = useLanguage()

  return (
    <footer className="mt-2 py-6 px-4 border-t border-gray-200 text-center text-sm text-gray-600">
      <div className="max-w-4xl mx-auto space-y-2">
        <p>
          {language === "en" ? (
            <>
              Developed using{" "}
              <Link
                href="https://v0.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                AI
              </Link>{" "}
              by{" "}
              <Link
                href="https://www.enyosam.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                Enyo Sam
              </Link>
              , a GSOM Student - built for the student community
            </>
          ) : (
            <>
              С помощью{" "}
              <Link
                href="https://v0.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                ИИ
              </Link>{" "}
              разработано{" "}
              <Link
                href="https://www.enyosam.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                Enyo Sam
              </Link>
              , студент ВШМ - создано для студенческого сообщества
            </>
          )}
        </p>
        <p>
          {language === "en"
            ? "For feedback or update of schedule, "
            : "Для обратной связи или обновления расписания, "}
          <Link
            href="https://t.me/enyosam"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline"
          >
            {language === "en" ? "send a message on Telegram" : "отправьте сообщение в Telegram"}
          </Link>
        </p>
      </div>
    </footer>
  )
}
