"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"

interface Degree {
  id: number
  name_en: string
  name_ru: string
  code: string
  created_at: string
  updated_at: string
}

export default function DegreesPage() {
  const [degrees, setDegrees] = useState<Degree[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null)
  const [formData, setFormData] = useState({
    name_en: "",
    name_ru: "",
    code: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchDegrees()
  }, [])

  const fetchDegrees = async () => {
    try {
      const response = await fetch("/api/admin/data?type=degrees")
      const data = await response.json()
      if (data.success) {
        setDegrees(data.data)
      }
    } catch (error) {
      console.error("Error fetching degrees:", error)
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
      const url = editingDegree ? `/api/admin/degrees/${editingDegree.id}` : "/api/admin/degrees"
      const method = editingDegree ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(editingDegree ? "Degree updated successfully" : "Degree created successfully")
        setIsDialogOpen(false)
        setEditingDegree(null)
        setFormData({ name_en: "", name_ru: "", code: "" })
        fetchDegrees()
      } else {
        setError(data.message || "Operation failed")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (degree: Degree) => {
    setEditingDegree(degree)
    setFormData({
      name_en: degree.name_en,
      name_ru: degree.name_ru,
      code: degree.code,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this degree?")) return

    try {
      const response = await fetch(`/api/admin/degrees/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("Degree deleted successfully")
        fetchDegrees()
      } else {
        setError(data.message || "Delete failed")
      }
    } catch (error) {
      setError("Network error occurred")
    }
  }

  const resetForm = () => {
    setEditingDegree(null)
    setFormData({ name_en: "", name_ru: "", code: "" })
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Degrees</h1>
          <p className="text-gray-600">Manage degree types (Bachelor's, Master's, etc.)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Degree
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDegree ? "Edit Degree" : "Add New Degree"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g., Bachelor's"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ru">Name (Russian)</Label>
                <Input
                  id="name_ru"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  placeholder="e.g., Бакалавриат"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., bachelor"
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
                  {isSaving ? "Saving..." : editingDegree ? "Update" : "Create"}
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
          <div className="col-span-full text-center py-8">Loading degrees...</div>
        ) : degrees.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No degrees found. Add your first degree to get started.
          </div>
        ) : (
          degrees.map((degree) => (
            <Card key={degree.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{degree.name_en}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(degree)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(degree.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Russian:</strong> {degree.name_ru}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Code:</strong> {degree.code}
                  </p>
                  <p className="text-xs text-gray-400">Created: {new Date(degree.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
