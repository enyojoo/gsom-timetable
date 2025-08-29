"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface EventFormProps {
  event?: any
  selectedSlot?: { date: Date; time: string } | null
  onSave: (eventData: any) => void
  onDelete?: () => void
  onCancel: () => void
}

const EVENT_TYPES = [
  { en: "Lecture", ru: "Лекция" },
  { en: "Seminar", ru: "Семинар" },
  { en: "Practical Lesson", ru: "Практическое занятие" },
  { en: "Group Consultation", ru: "Групповая консультация" },
  { en: "Credit", ru: "Зачет" },
  { en: "Exam", ru: "Экзамен" },
  { en: "Display of Works", ru: "Показ работ" },
]

const RECURRENCE_PATTERNS = [
  { value: "none", label: "No recurrence" },
  { value: "weekly", label: "Weekly (every week)" },
  { value: "biweekly", label: "Bi-weekly (every 2 weeks)" },
  { value: "custom", label: "Custom pattern" },
]

const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
]

export function EventForm({ event, selectedSlot, onSave, onDelete, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title_en: "",
    title_ru: "",
    type_en: "",
    type_ru: "",
    teacher_en: "",
    teacher_ru: "",
    room: "",
    address_en: "",
    address_ru: "",
    start_time: "",
    end_time: "",
    date: "",
    is_recurring: false,
    recurrence_pattern: "none",
    recurrence_end_date: "",
    custom_days: [] as string[],
  })
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title_en: event.title_en || "",
        title_ru: event.title_ru || "",
        type_en: event.type_en || "",
        type_ru: event.type_ru || "",
        teacher_en: event.teacher_en || "",
        teacher_ru: event.teacher_ru || "",
        room: event.room || "",
        address_en: event.address_en || "",
        address_ru: event.address_ru || "",
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        date: event.date || "",
        is_recurring: event.is_recurring || false,
        recurrence_pattern: event.recurrence_pattern || "none",
        recurrence_end_date: event.recurrence_end_date || "",
        custom_days: [],
      })
    } else if (selectedSlot) {
      // Creating new event
      const endTime = calculateEndTime(selectedSlot.time)
      setFormData({
        title_en: "",
        title_ru: "",
        type_en: "",
        type_ru: "",
        teacher_en: "",
        teacher_ru: "",
        room: "",
        address_en: "",
        address_ru: "",
        start_time: selectedSlot.time,
        end_time: endTime,
        date: format(selectedSlot.date, "yyyy-MM-dd"),
        is_recurring: false,
        recurrence_pattern: "none",
        recurrence_end_date: "",
        custom_days: [],
      })
    }
  }, [event, selectedSlot])

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endHours = hours + 1
    const endMinutes = minutes + 30
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`
  }

  const handleTypeChange = (typeEn: string) => {
    const eventType = EVENT_TYPES.find((t) => t.en === typeEn)
    if (eventType) {
      setFormData({
        ...formData,
        type_en: eventType.en,
        type_ru: eventType.ru,
      })
    }
  }

  const handleCustomDayToggle = (day: string, checked: boolean) => {
    const updatedDays = checked ? [...formData.custom_days, day] : formData.custom_days.filter((d) => d !== day)

    setFormData({
      ...formData,
      custom_days: updatedDays,
    })
  }

  const validateForm = () => {
    if (!formData.title_en.trim()) return "English title is required"
    if (!formData.title_ru.trim()) return "Russian title is required"
    if (!formData.type_en) return "Event type is required"
    if (!formData.start_time) return "Start time is required"
    if (!formData.end_time) return "End time is required"
    if (formData.start_time >= formData.end_time) return "End time must be after start time"
    if (formData.is_recurring && formData.recurrence_pattern !== "none" && !formData.recurrence_end_date) {
      return "End date is required for recurring events"
    }
    if (formData.recurrence_pattern === "custom" && formData.custom_days.length === 0) {
      return "Select at least one day for custom recurrence"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSaving(true)

    try {
      await onSave(formData)
    } catch (error) {
      setError("Failed to save event")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title_en">Subject (English) *</Label>
            <Input
              id="title_en"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g., Strategic Management"
              required
            />
          </div>
          <div>
            <Label htmlFor="title_ru">Subject (Russian) *</Label>
            <Input
              id="title_ru"
              value={formData.title_ru}
              onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
              placeholder="e.g., Стратегический менеджмент"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="type">Event Type *</Label>
          <Select value={formData.type_en} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => (
                <SelectItem key={type.en} value={type.en}>
                  {type.en} / {type.ru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="teacher_en">Teacher (English)</Label>
            <Input
              id="teacher_en"
              value={formData.teacher_en}
              onChange={(e) => setFormData({ ...formData, teacher_en: e.target.value })}
              placeholder="e.g., Dr. John Smith"
            />
          </div>
          <div>
            <Label htmlFor="teacher_ru">Teacher (Russian)</Label>
            <Input
              id="teacher_ru"
              value={formData.teacher_ru}
              onChange={(e) => setFormData({ ...formData, teacher_ru: e.target.value })}
              placeholder="e.g., Д-р Джон Смит"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g., 301"
            />
          </div>
          <div>
            <Label htmlFor="address_en">Address (English)</Label>
            <Input
              id="address_en"
              value={formData.address_en}
              onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
              placeholder="e.g., Main Building"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address_ru">Address (Russian)</Label>
          <Input
            id="address_ru"
            value={formData.address_ru}
            onChange={(e) => setFormData({ ...formData, address_ru: e.target.value })}
            placeholder="e.g., Главное здание"
          />
        </div>
      </div>

      {/* Time Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Time & Date</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="start_time">Start Time *</Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time *</Label>
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Recurrence Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recurrence</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                is_recurring: checked as boolean,
                recurrence_pattern: checked ? "weekly" : "none",
              })
            }
          />
          <Label htmlFor="is_recurring">Make this a recurring event</Label>
        </div>

        {formData.is_recurring && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            <div>
              <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
              <Select
                value={formData.recurrence_pattern}
                onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_PATTERNS.filter((p) => p.value !== "none").map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence_pattern === "custom" && (
              <div>
                <Label>Select Days</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {WEEKDAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={formData.custom_days.includes(day.value)}
                        onCheckedChange={(checked) => handleCustomDayToggle(day.value, checked as boolean)}
                      />
                      <Label htmlFor={day.value} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="recurrence_end_date">End Date *</Label>
              <Input
                id="recurrence_end_date"
                type="date"
                value={formData.recurrence_end_date}
                onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                min={formData.date}
                required
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div>
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : event ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </div>
    </form>
  )
}
