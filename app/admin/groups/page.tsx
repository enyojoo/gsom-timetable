"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle2, Filter } from "lucide-react"

interface Program {
  id: number
  degree_id: number
  name_en: string
  name_ru: string
  code: string
  degree_name_en: string
  degree_name_ru: string
}

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
  created_at: string
  updated_at: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    program_id: "",
    year: "",
    code: "",
    name_en: "",
    name_ru: "",
  })
  const [filters, setFilters] = useState({
    program_id: "",
    year: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [groups, filters])

  const fetchData = async () => {
    try {
      const [groupsRes, programsRes] = await Promise.all([
        fetch("/api/admin/data?type=groups"),
        fetch("/api/admin/data?type=programs"),
      ])

      const [groupsData, programsData] = await Promise.all([groupsRes.json(), programsRes.json()])

      if (groupsData.success) setGroups(groupsData.data)
      if (programsData.success) setPrograms(programsData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = groups

    if (filters.program_id) {
      filtered = filtered.filter((group) => group.program_id.toString() === filters.program_id)
    }

    if (filters.year) {
      filtered = filtered.filter((group) => group.year.toString() === filters.year)
    }

    setFilteredGroups(filtered)
  }

  const generateFullCode = (year: string, code: string) => {
    const yearPrefix = year.substring(2) // Get last 2 digits
    return `${yearPrefix}.${code.toUpperCase()}-vshm`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const fullCode = generateFullCode(formData.year, formData.code)

      const url = editingGroup ? `/api/admin/groups/${editingGroup.id}` : "/api/admin/groups"
      const method = editingGroup ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          program_id: Number.parseInt(formData.program_id),
          year: Number.parseInt(formData.year),
          full_code: fullCode,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(editingGroup ? "Group updated successfully" : "Group created successfully")
        setIsDialogOpen(false)
        setEditingGroup(null)
        setFormData({ program_id: "", year: "", code: "", name_en: "", name_ru: "" })
        fetchData()
      } else {
        setError(data.message || "Operation failed")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      program_id: group.program_id.toString(),
      year: group.year.toString(),
      code: group.code,
      name_en: group.name_en,
      name_ru: group.name_ru,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      const response = await fetch(`/api/admin/groups/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Group deleted successfully")
        fetchData()
      } else {
        setError(data.message || "Delete failed")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setEditingGroup(null)
    setFormData({ program_id: "", year: "", code: "", name_en: "", name_ru: "" })
    setError("")
    setSuccess("")
  }

  const uniqueYears = Array.from(new Set(groups.map((g) => g.year))).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage student groups for each program and year</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Group" : "Add New Group"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="program_id">Program</Label>
                <Select
                  value={formData.program_id}
                  onValueChange={(value) => setFormData({ ...formData, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.degree_name_en} - {program.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2024"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., B01, M01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">Display Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g., B01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ru">Display Name (Russian)</Label>
                <Input
                  id="name_ru"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  placeholder="e.g., Б01"
                  required
                />
              </div>
              {formData.year && formData.code && (
                <div className="text-sm text-gray-600">
                  <strong>Full Code:</strong> {generateFullCode(formData.year, formData.code)}
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingGroup ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-program">Program</Label>
              <Select
                value={filters.program_id}
                onValueChange={(value) => setFilters({ ...filters, program_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.degree_name_en} - {program.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-year">Year</Label>
              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {success && (
        <Alert className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && !isDialogOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No groups found.{" "}
            {filters.program_id !== "all" || filters.year !== "all" ? "Try adjusting your filters or " : ""}Add your
            first group to get started.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>
                    {group.name_en} ({group.year})
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(group)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(group.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Russian:</strong> {group.name_ru}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Full Code:</strong> {group.full_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Program:</strong> {group.program_name_en}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Degree:</strong> {group.degree_name_en}
                  </p>
                  <p className="text-xs text-gray-400">Created: {new Date(group.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
