"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Team } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface TeamFormProps {
  team?: Team
  onSubmit: (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const categories = [
  { value: "U6", label: "Sub-6 (4-6 años)" },
  { value: "U8", label: "Sub-8 (6-8 años)" },
  { value: "U10", label: "Sub-10 (8-10 años)" },
  { value: "U12", label: "Sub-12 (10-12 años)" },
  { value: "U14", label: "Sub-14 (12-14 años)" },
  { value: "U16", label: "Sub-16 (14-16 años)" },
  { value: "U18", label: "Sub-18 (16-18 años)" },
]

export function TeamForm({ team, onSubmit, onCancel, loading = false }: TeamFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: team?.name || "",
    category: team?.category || "",
    coach_name: team?.coach_name || "",
    description: team?.description || "",
    max_players: team?.max_players || 25,
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.category) {
      setError("Nombre y categoría son obligatorios")
      return
    }

    try {
      await onSubmit(formData)
      toast({
        title: team ? "Equipo actualizado" : "Equipo creado",
        description: team
          ? `El equipo "${formData.name}" ha sido actualizado exitosamente.`
          : `El equipo "${formData.name}" ha sido creado exitosamente.`,
        variant: "success",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el equipo"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <CardTitle>{team ? "Editar Equipo" : "Crear Nuevo Equipo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Equipo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Leones Sub-10"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-green-500">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coach_name">Nombre del Entrenador</Label>
              <Input
                id="coach_name"
                value={formData.coach_name}
                onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                placeholder="Nombre del entrenador"
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_players">Máximo de Jugadores</Label>
              <Input
                id="max_players"
                type="number"
                min="10"
                max="30"
                value={formData.max_players}
                onChange={(e) => setFormData({ ...formData, max_players: Number.parseInt(e.target.value) || 25 })}
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del equipo, objetivos, horarios, etc."
              rows={3}
              className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="transition-all duration-200">
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? "Guardando..." : team ? "Actualizar Equipo" : "Crear Equipo"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
