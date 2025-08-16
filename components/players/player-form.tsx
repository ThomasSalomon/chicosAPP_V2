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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import type { Player } from "@/lib/database"
import { useTeams } from "@/hooks/use-teams"

interface PlayerFormProps {
  player?: Player
  onSubmit: (playerData: Omit<Player, "id" | "created_at" | "updated_at">) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const positions = [
  { value: "Goalkeeper", label: "Portero" },
  { value: "Defender", label: "Defensor" },
  { value: "Midfielder", label: "Mediocampista" },
  { value: "Forward", label: "Delantero" },
]

export function PlayerForm({ player, onSubmit, onCancel, loading = false }: PlayerFormProps) {
  const { teams } = useTeams()
  const [formData, setFormData] = useState({
    name: player?.name || "",
    birth_date: player?.birth_date || "",
    position: player?.position || "Goalkeeper",
    team_id: player?.team_id || null,
    parent_name: player?.parent_name || "",
    parent_phone: player?.parent_phone || "",
    parent_email: player?.parent_email || "",
    medical_notes: player?.medical_notes || "",
    emergency_contact: player?.emergency_contact || "",
    emergency_phone: player?.emergency_phone || "",
    registration_date: player?.registration_date || new Date().toISOString().split("T")[0],
    is_active: player?.is_active ?? true,
  })
  const [error, setError] = useState("")

  // Función para calcular edad desde fecha de nacimiento
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const currentAge = formData.birth_date ? calculateAge(formData.birth_date) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.birth_date) {
      setError("Nombre y fecha de nacimiento son obligatorios")
      return
    }

    const age = calculateAge(formData.birth_date)
    if (age < 4 || age > 18) {
      setError("La edad debe estar entre 4 y 18 años")
      return
    }

    try {
      await onSubmit({
        ...formData,
        team_id: formData.team_id || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el jugador")
    }
  }

  return (
    <Card className="w-full max-w-4xl card-mobile">
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">{player ? "Editar Jugador" : "Registrar Nuevo Jugador"}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="basic" className="text-xs sm:text-sm px-2 sm:px-4">Básica</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 sm:px-4">Contacto</TabsTrigger>
              <TabsTrigger value="medical" className="text-xs sm:text-sm px-2 sm:px-4">Médica</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3 sm:space-y-4">
              <div className="flex-mobile-col gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre completo del jugador"
                    className="input-mobile"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                    required
                  />
                  {formData.birth_date && (
                    <p className="text-sm text-gray-600">
                      Edad actual: {currentAge} años
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Posición</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una posición" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team">Equipo</Label>
                  <Select
                    value={formData.team_id?.toString() || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, team_id: value ? Number.parseInt(value) : null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin equipo</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name} ({team.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_date">Fecha de Registro</Label>
                  <Input
                    id="registration_date"
                    type="date"
                    value={formData.registration_date}
                    onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Jugador Activo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Nombre del Padre/Madre</Label>
                  <Input
                    id="parent_name"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder="Nombre completo del padre o madre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Teléfono del Padre/Madre</Label>
                  <Input
                    id="parent_phone"
                    type="tel"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Email del Padre/Madre</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  placeholder="padre@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Nombre del contacto de emergencia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergency_phone"
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical_notes">Notas Médicas</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                  placeholder="Alergias, medicamentos, condiciones médicas, lesiones previas, etc."
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  Incluye información importante como alergias, medicamentos que toma, condiciones médicas especiales,
                  lesiones previas, etc.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" disabled={loading} className="touch-target btn-mobile flex-1">
              {loading ? "Guardando..." : player ? "Actualizar" : "Registrar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="touch-target btn-mobile flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
