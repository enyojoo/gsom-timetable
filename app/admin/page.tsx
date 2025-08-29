"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, Calendar } from "lucide-react"

interface DashboardStats {
  degrees: number
  programs: number
  groups: number
  events: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    degrees: 0,
    programs: 0,
    groups: 0,
    events: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [degreesRes, programsRes, groupsRes, eventsRes] = await Promise.all([
          fetch("/api/admin/data?type=degrees"),
          fetch("/api/admin/data?type=programs"),
          fetch("/api/admin/data?type=groups"),
          fetch("/api/admin/data?type=schedule"),
        ])

        const [degrees, programs, groups, events] = await Promise.all([
          degreesRes.json(),
          programsRes.json(),
          groupsRes.json(),
          eventsRes.json(),
        ])

        setStats({
          degrees: degrees.success ? degrees.data.length : 0,
          programs: programs.success ? programs.data.length : 0,
          groups: groups.success ? groups.data.length : 0,
          events: events.success ? events.data.length : 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Degrees",
      value: stats.degrees,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Programs",
      value: stats.programs,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Groups",
      value: stats.groups,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Schedule Events",
      value: stats.events,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your GSOM timetable system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-md ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">• Add new degrees, programs, and groups</p>
            <p className="text-sm text-gray-600">• Manage schedule events with calendar interface</p>
            <p className="text-sm text-gray-600">• Import/export schedule data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">File Storage</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <span className="text-sm text-green-600">Secure</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
