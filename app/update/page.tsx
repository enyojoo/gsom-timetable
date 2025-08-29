"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Download, ArrowLeft } from "lucide-react"
import { generateSlug } from "@/lib/program-utils"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

// Add a constant for the Blob directory at the top of the file, after the imports
const BLOB_DIRECTORY = "gsom-files/schedule/"

export default function UpdatePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const [year, setYear] = useState("24")
  const [group, setGroup] = useState("b01")
  const [language, setLanguage] = useState("en")
  const [fileContent, setFileContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [updatedFileUrl, setUpdatedFileUrl] = useState("")
  const [currentFileName, setCurrentFileName] = useState("")

  // Map group codes to programs for slug generation
  const getProgramForGroup = (groupCode: string): string => {
    const groupNumber = Number.parseInt(groupCode.substring(1), 10)

    if (groupCode.startsWith("b")) {
      if (groupNumber >= 1 && groupNumber <= 8) {
        return "Management"
      } else if (groupNumber >= 9 && groupNumber <= 10) {
        return "Public Administration"
      } else if (groupNumber >= 11 && groupNumber <= 12) {
        return "International Management"
      }
    } else if (groupCode.startsWith("m")) {
      if (groupNumber === 1) {
        return "Management"
      } else if (groupNumber === 2) {
        return "Corporate Finance"
      } else if (groupNumber === 3) {
        return "Smart City Management"
      } else if (groupNumber === 4) {
        return "Business Analytics and Big Data"
      }
    }

    return "Management" // Default fallback
  }

  // Determine if it's a master's program
  const isMasterProgram = (groupCode: string): boolean => {
    return groupCode.startsWith("m")
  }

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setAuthError("")

    try {
      // Create a fresh request each time
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      // Clone the response before reading its JSON
      const clonedResponse = response.clone()
      const data = await clonedResponse.json()

      if (data.success) {
        setIsAuthenticated(true)
        setAuthError("")
      } else {
        setAuthError(data.message || "Authentication failed")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setAuthError("An error occurred during authentication")
    } finally {
      setIsAuthenticating(false)
    }
  }

  const loadFile = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const fileName = `${language === "ru" ? "ru-" : ""}schedule-${year}-${group}.txt`
      setCurrentFileName(fileName)

      const response = await fetch(`/api/schedule-file?file=${fileName}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to load file: ${response.statusText}`)
      }

      const content = await response.text()
      setFileContent(content)
      setSuccess(t("update.fileLoaded").replace("{fileName}", fileName))
    } catch (error) {
      console.error("Error loading file:", error)
      setError(error instanceof Error ? error.message : "Failed to load schedule")
      setFileContent("")
    } finally {
      setIsLoading(false)
    }
  }

  const saveFile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")
    setUpdatedFileUrl("")

    try {
      const fileName = currentFileName || `${language === "ru" ? "ru-" : ""}schedule-${year}-${group}.txt`
      const response = await fetch("/api/update-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          content: fileContent,
        }),
      })

      // Clone the response before reading its JSON
      const clonedResponse = response.clone()
      const data = await clonedResponse.json()

      if (data.success) {
        setSuccess(t("update.fileSaved").replace("{fileName}", fileName))

        // Generate the correct slug for the schedule
        const program = getProgramForGroup(group)
        const degree = isMasterProgram(group) ? "master" : "bachelor"
        const fullYear = `20${year}`

        // Create a group pattern that matches the format expected by generateSlug
        // e.g., "24.B01-vshm" for group "b01" and year "24"
        const groupPattern = `${year}.${group.toUpperCase()}-vshm`

        const slug = generateSlug(program, fullYear, groupPattern, degree)
        setUpdatedFileUrl(`/${slug}`)
      } else {
        throw new Error(data.message || data.error || "Failed to save file")
      }
    } catch (error) {
      console.error("Error saving file:", error)
      setError(error instanceof Error ? error.message : "Failed to save schedule")
    } finally {
      setIsSaving(false)
    }
  }

  const downloadFile = () => {
    if (!fileContent) return

    const fileName = currentFileName || `${language === "ru" ? "ru-" : ""}schedule-${year}-${group}.txt`
    const blob = new Blob([fileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle Enter key in password field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      authenticate(e as unknown as React.FormEvent)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex justify-center mb-4">
            <LanguageSwitcher />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">{t("update.authRequired")}</h1>
          <p className="mb-4 text-center text-gray-600">{t("update.enterPassword")}</p>

          <form onSubmit={authenticate} className="space-y-4">
            <div>
              <Label htmlFor="password">{t("update.password")}</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1"
              />
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("update.error")}</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isAuthenticating} className="w-full">
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("update.authenticating")}
                </>
              ) : (
                t("update.authenticate")
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("timetable.return")}</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("update.title")}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("update.howItWorks")}</h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <strong>{t("update.updates")}:</strong> {t("update.updatesDesc")}
          </p>
          <p>
            <strong>{t("update.security")}:</strong> {t("update.securityDesc")}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("update.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>{t("update.success")}</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {updatedFileUrl && (
        <Alert className="mb-6 border-blue-500">
          <AlertTitle>{t("update.viewUpdated")}</AlertTitle>
          <AlertDescription>
            <Link href={updatedFileUrl} className="text-blue-500 underline">
              {t("update.viewUpdatedLink")}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("update.selectSchedule")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="year">{t("update.year")}</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder={t("update.year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="21">2021</SelectItem>
                <SelectItem value="22">2022</SelectItem>
                <SelectItem value="23">2023</SelectItem>
                <SelectItem value="24">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="group">{t("update.group")}</Label>
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger id="group">
                <SelectValue placeholder={t("update.group")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b01">B01</SelectItem>
                <SelectItem value="b02">B02</SelectItem>
                <SelectItem value="b03">B03</SelectItem>
                <SelectItem value="b04">B04</SelectItem>
                <SelectItem value="b05">B05</SelectItem>
                <SelectItem value="b06">B06</SelectItem>
                <SelectItem value="b07">B07</SelectItem>
                <SelectItem value="b08">B08</SelectItem>
                <SelectItem value="b09">B09</SelectItem>
                <SelectItem value="b10">B10</SelectItem>
                <SelectItem value="b11">B11</SelectItem>
                <SelectItem value="b12">B12</SelectItem>
                <SelectItem value="m01">M01</SelectItem>
                <SelectItem value="m02">M02</SelectItem>
                <SelectItem value="m03">M03</SelectItem>
                <SelectItem value="m04">M04</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">{t("update.language")}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder={t("update.language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={loadFile} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("update.loading")}
            </>
          ) : (
            t("update.loadSchedule")
          )}
        </Button>
      </div>

      {fileContent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t("update.editSchedule")}</h2>

          <div className="mb-4">
            <Label htmlFor="fileContent">{t("update.scheduleContent")}</Label>
            <Textarea
              id="fileContent"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="font-mono h-96"
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={saveFile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("update.saving")}
                </>
              ) : (
                t("update.saveSchedule")
              )}
            </Button>

            <Button variant="outline" onClick={downloadFile} disabled={!fileContent}>
              <Download className="mr-2 h-4 w-4" />
              {t("update.downloadSchedule")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
