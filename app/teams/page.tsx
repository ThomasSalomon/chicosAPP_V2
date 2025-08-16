"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTeams } from "@/hooks/use-teams"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { TeamCard } from "@/components/teams/team-card"
import dynamic from "next/dynamic"

const TeamForm = dynamic(() => import("@/components/teams/team-form").then(mod => ({ default: mod.TeamForm })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
})
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Users } from "lucide-react"
import type { Team } from "@/lib/database"

export default function TeamsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [formLoading, setFormLoading] = useState(false)

  const { teams, loading, error, createTeam, updateTeam, deleteTeam } = useTeams(searchTerm)

  const filteredTeams = teams.filter((team) => {
    const matchesCategory = categoryFilter === "all" || team.category === categoryFilter
    return matchesCategory
  })

  const categories = Array.from(new Set(teams.map((team) => team.category))).sort()

  const handleSubmit = async (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => {
    setFormLoading(true)
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, teamData)
      } else {
        await createTeam(teamData)
      }
      setShowForm(false)
      setEditingTeam(null)
    } catch (error) {
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setShowForm(true)
  }

  const handleDelete = async (team: Team) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${team.name}"?`)) {
      try {
        await deleteTeam(team.id)
      } catch (error) {
        alert("Error al eliminar el equipo")
      }
    }
  }

  const handleViewPlayers = (team: Team) => {
    // Navegar a la página de jugadores con filtro de equipo
    router.push(`/players?team=${team.id}&teamName=${encodeURIComponent(team.name)}`)
  }

  const canCreateTeam = user?.role === "admin" || user?.role === "coach"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />

          {showForm ? (
            <div className="flex justify-center">
              <TeamForm
                team={editingTeam || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTeam(null)
                }}
                loading={formLoading}
              />
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
                  <p className="text-gray-600 mt-1">Administra los equipos de tu academia</p>
                </div>
                {canCreateTeam && (
                  <Button onClick={() => setShowForm(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nuevo Equipo
                  </Button>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar equipos o entrenadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Error State */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Teams Grid */}
                  {filteredTeams.length > 0 ? (
                    <div className="grid-auto-fit">
                      {filteredTeams.map((team) => (
                        <TeamCard
                          key={team.id}
                          team={team}
                          playerCount={team.playerCount || 0}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onViewPlayers={handleViewPlayers}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Users className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || categoryFilter !== "all"
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Comienza creando tu primer equipo"}
                      </p>
                      {canCreateTeam && !searchTerm && categoryFilter === "all" && (
                        <Button onClick={() => setShowForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Equipo
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
