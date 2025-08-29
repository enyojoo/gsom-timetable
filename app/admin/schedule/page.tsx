"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { EventForm } from "@/components/admin/event-form"

interface Group {
  id: number
  program_id: number
  year: number
  code: string
  full_code: string
  name_en: string
  name_ru: string
  program_name_en: string
  program_name_ru: string
  degree_name_en: string
  degree_name_ru: string
}

interface ScheduleEvent {
  id: number
  group_id: number
  title_en: string
  title_ru: string
  type_en: string
  type_ru: string
  teacher_en?: string
  teacher_ru?: string
  room?: string
  address_en?: string
  address_ru?: string
  start_time: string
  end_time: string
  date: string
  is_recurring: boolean
  recurrence_pattern?: string
  recurrence_end_date?: string
}

interface TimeSlot {
  time: string
  displayTime: string
}

const TIME_SLOTS: TimeSlot[] = [
  { time: "08:00", displayTime: "8:00 AM" },
  { time: "08:30", displayTime: "8:30 AM" },
  { time: "09:00", displayTime: "9:00 AM" },
  { time: "09:30", displayTime: "9:30 AM" },
  { time: "10:00", displayTime: "10:00 AM" },
  { time: "10:30", displayTime: "10:30 AM" },
  { time: "11:00", displayTime: "11:00 AM" },
  { time: "11:30", displayTime: "11:30 AM" },
  { time: "12:00", displayTime: "12:00 PM" },
  { time: "12:30", displayTime: "12:30 PM" },
  { time: "13:00", displayTime: "1:00 PM" },
  { time: "13:30", displayTime: "1:30 PM" },
  { time: "14:00", displayTime: "2:00 PM" },
  { time: "14:30", displayTime: "2:30 PM" },
  { time: "15:00", displayTime: "3:00 PM" },
  { time: "15:30", displayTime: "3:30 PM" },
  { time: "16:00", displayTime: "4:00 PM" },
  { time: "16:30", displayTime: "4:30 PM" },
  { time: "17:00", displayTime: "5:00 PM" },
  { time: "17:30", displayTime: "5:30 PM" },
  { time: "18:00", displayTime: "6:00 PM" },
  { time: "18:30", displayTime: "6:30 PM" },
  { time: "19:00", displayTime: "7:00 PM" },
  { time: "19:30", displayTime: "7:30 PM" },
  { time: "20:00", displayTime: "8:00 PM" },
]

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function SchedulePage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchEvents()
    }
  }, [selectedGroup, currentWeek])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/data?type=groups")
      const data = await response.json()
      if (data.success) {
        setGroups(data.data)
        if (data.data.length > 0) {
          setSelectedGroup(data.data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
      setError("Failed to load groups")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvents = async () => {
    if (!selectedGroup) return

    try {
      const startDate = format(currentWeek, "yyyy-MM-dd")
      const endDate = format(addDays(currentWeek, 6), "yyyy-MM-dd")

      const response = await fetch(
        `/api/admin/data?type=schedule&groupId=${selectedGroup.id}&startDate=${startDate}&endDate=${endDate}`,
      )
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Failed to load schedule events")
    }
  }

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time })
    setEditingEvent(null)
    setIsEventDialogOpen(true)
  }

  const handleEventClick = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setSelectedSlot(null)
    setIsEventDialogOpen(true)
  }

  const handleEventSave = async (eventData: any) => {
    try {
      const url = editingEvent ? `/api/admin/schedule/${editingEvent.id}` : "/api/admin/schedule"
      const method = editingEvent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...eventData,
          group_id: selectedGroup?.id,
          date: selectedSlot ? format(selectedSlot.date, "yyyy-MM-dd") : eventData.date,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(editingEvent ? "Event updated successfully" : "Event created successfully")
        setIsEventDialogOpen(false)
        fetchEvents()
      } else {
        setError(data.message || "Failed to save event")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const handleEventDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/admin/schedule/${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Event deleted successfully")
        setIsEventDialogOpen(false)
        fetchEvents()
      } else {
        setError(data.message || "Failed to delete event")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const getEventsForSlot = (date: Date, time: string) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.date)
      const eventTime = event.start_time.substring(0, 5)
      return isSameDay(eventDate, date) && eventTime === time
    })
  }

  const getEventTypeColor = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes("lecture") || lowerType.includes("лекция"))
      return "bg-blue-100 border-blue-300 text-blue-800"
    if (lowerType.includes("seminar") || lowerType.includes("семинар"))
      return "bg-green-100 border-green-300 text-green-800"
    if (lowerType.includes("practical") || lowerType.includes("практическое"))
      return "bg-purple-100 border-purple-300 text-purple-800"
    if (lowerType.includes("consultation") || lowerType.includes("консультация"))
      return "bg-yellow-100 border-yellow-300 text-yellow-800"
    return "bg-gray-100 border-gray-300 text-gray-800"
  }

  const weekDays = WEEKDAYS.map((day, index) => ({
    name: day,
    date: addDays(currentWeek, index),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600">Manage class schedules with calendar interface</p>
        </div>
      </div>

      {/* Group Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Group</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedGroup?.id.toString() || ""}
            onValueChange={(value) => {
              const group = groups.find((g) => g.id.toString() === value)
              setSelectedGroup(group || null)
            }}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a group to manage schedule" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.degree_name_en} - {group.program_name_en} - {group.name_en} ({group.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {success && (
        <Alert className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedGroup && (
        <>
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="h-4 w-4" />
                Previous Week
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                This Week
              </Button>
              <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                Next Week
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-lg font-semibold">
              {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </div>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-7 border-b">
                    <div className="p-3 bg-gray-50 border-r font-medium">Time</div>
                    {weekDays.map((day) => (
                      <div key={day.name} className="p-3 bg-gray-50 border-r text-center">
                        <div className="font-medium">{day.name}</div>
                        <div className="text-sm text-gray-600">{format(day.date, "MMM d")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {TIME_SLOTS.map((slot) => (
                    <div key={slot.time} className="grid grid-cols-7 border-b hover:bg-gray-50">
                      <div className="p-2 border-r bg-gray-50 text-sm font-medium text-center">{slot.displayTime}</div>
                      {weekDays.map((day) => {
                        const slotEvents = getEventsForSlot(day.date, slot.time)
                        return (
                          <div
                            key={`${day.name}-${slot.time}`}
                            className="p-1 border-r min-h-[60px] cursor-pointer hover:bg-blue-50 relative"
                            onClick={() => slotEvents.length === 0 && handleSlotClick(day.date, slot.time)}
                          >
                            {slotEvents.length === 0 ? (
                              <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100">
                                <Plus className="h-4 w-4 text-gray-400" />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {slotEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className={`p-1 rounded text-xs border cursor-pointer ${getEventTypeColor(event.type_en)}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEventClick(event)
                                    }}
                                  >
                                    <div className="font-medium truncate">{event.title_en}</div>
                                    <div className="truncate">{event.type_en}</div>
                                    {event.room && <div className="truncate">Room: {event.room}</div>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
            selectedSlot={selectedSlot}
            onSave={handleEventSave}
            onDelete={editingEvent ? () => handleEventDelete(editingEvent.id) : undefined}
            onCancel={() => setIsEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
