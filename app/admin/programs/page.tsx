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
import { Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"

interface Degree {
  id: number
  name_en: string
  name_ru: string
  code: string
}

interface Program {
  id: number
  degree_id: number
  name_en: string
  name_ru: string
  code: string
  degree_name_en: string
  degree_name_ru: string
  created_at: string
  updated_at: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState({
    degree_id: "",
    name_en: "",
    name_ru: "",
    code: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [programsRes, degreesRes] = await Promise.all([
        fetch("/api/admin/data?type=programs"),
        fetch("/api/admin/data?type=degrees"),
      ])

      const [programsData, degreesData] = await Promise.all([programsRes.json(), degreesRes.json()])

      if (programsData.success) setPrograms(programsData.data)
      if (degreesData.success) setDegrees(degreesData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const url = editingProgram ? `/api/admin/programs/${editingProgram.id}` : "/api/admin/programs"
      const method = editingProgram ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          degree_id: Number.parseInt(formData.degree_id),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(editingProgram ? "Program updated successfully" : "Program created successfully")
        setIsDialogOpen(false)
        setEditingProgram(null)
        setFormData({ degree_id: "", name_en: "", name_ru: "", code: "" })
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

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      degree_id: program.degree_id.toString(),
      name_en: program.name_en,
      name_ru: program.name_ru,
      code: program.code,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this program?")) return

    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Program deleted successfully")
        fetchData()
      } else {
        setError(data.message || "Delete failed")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setEditingProgram(null)
    setFormData({ degree_id: "", name_en: "", name_ru: "", code: "" })
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600">Manage academic programs for each degree</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="degree_id">Degree</Label>
                <Select
                  value={formData.degree_id}
                  onValueChange={(value) => setFormData({ ...formData, degree_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees.map((degree) => (
                      <SelectItem key={degree.id} value={degree.id.toString()}>
                        {degree.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g., Management"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ru">Name (Russian)</Label>
                <Input
                  id="name_ru"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  placeholder="e.g., Менеджмент"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., management"
                  required
                />
              </div>
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
                  {isSaving ? "Saving..." : editingProgram ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          <div className="col-span-full text-center py-8">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No programs found. Add your first program to get started.
          </div>
        ) : (
          programs.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{program.name_en}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(program)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Russian:</strong> {program.name_ru}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Code:</strong> {program.code}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Degree:</strong> {program.degree_name_en}
                  </p>
                  <p className="text-xs text-gray-400">Created: {new Date(program.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
