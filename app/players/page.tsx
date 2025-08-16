"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { usePlayers } from "@/hooks/use-players"
import { useTeams } from "@/hooks/use-teams"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PlayerCard } from "@/components/players/player-card"
import dynamic from "next/dynamic"

const PlayerForm = dynamic(() => import("@/components/players/player-form").then(mod => ({ default: mod.PlayerForm })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
})
import { PlayerDetailsModal } from "@/components/players/player-details-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Users } from "lucide-react"
import type { Player } from "@/lib/database"
import { Suspense } from 'react'
import Loading from './loading'

export default function PlayersPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState<number | undefined>(undefined)
  const [teamNameFromUrl, setTeamNameFromUrl] = useState<string>("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [recentlyEditedPlayerId, setRecentlyEditedPlayerId] = useState<number | null>(null)
  const [focusPlayerId, setFocusPlayerId] = useState<number | null>(null)
  const [focusPlayerName, setFocusPlayerName] = useState<string>("")

  // Leer parámetros de la URL al cargar la página
  useEffect(() => {
    const teamParam = searchParams.get('team')
    const teamNameParam = searchParams.get('teamName')
    const focusPlayerParam = searchParams.get('focusPlayer')
    const playerNameParam = searchParams.get('playerName')
    
    if (teamParam) {
      const teamId = parseInt(teamParam)
      if (!isNaN(teamId)) {
        setTeamFilter(teamId)
        setTeamNameFromUrl(teamNameParam || '')
      }
    }

    if (focusPlayerParam) {
      const playerId = parseInt(focusPlayerParam)
      if (!isNaN(playerId)) {
        setFocusPlayerId(playerId)
        setFocusPlayerName(playerNameParam || '')
      }
    }
  }, [searchParams])

  const { players, loading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers(teamFilter, searchTerm)
  const { teams } = useTeams()
  const { user } = useAuth()

  // Auto-scroll al jugador enfocado cuando se carga la página
  useEffect(() => {
    if (focusPlayerId && !loading) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-player-id="${focusPlayerId}"]`)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          })
        }
      }, 500) // Esperar a que se renderice la página
      
      return () => clearTimeout(timer)
    }
  }, [focusPlayerId, loading])

  // Auto-quitar foco después de 10 segundos
  useEffect(() => {
    if (focusPlayerId) {
      const timer = setTimeout(() => {
        setFocusPlayerId(null)
        setFocusPlayerName("")
      }, 10000) // 10 segundos
      
      return () => clearTimeout(timer)
    }
  }, [focusPlayerId])

  const filteredPlayers = players.filter((player) => {
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesPosition
  })

  const positions = Array.from(new Set(players.map((player) => player.position).filter(Boolean))).sort()

  const handleSubmit = async (playerData: Omit<Player, "id" | "created_at" | "updated_at">) => {
    setFormLoading(true)
    try {
      let playerId: number
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, playerData)
        playerId = editingPlayer.id
        
        // Activar efecto de foco para el jugador editado
        setRecentlyEditedPlayerId(playerId)
        
        // Hacer scroll hacia el jugador editado después de un breve delay
        setTimeout(() => {
          const playerElement = document.querySelector(`[data-player-id="${playerId}"]`)
          if (playerElement) {
            playerElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        }, 300)
        
        // Quitar el efecto después de 3 segundos
        setTimeout(() => {
          setRecentlyEditedPlayerId(null)
        }, 3000)
      } else {
        const newPlayer = await createPlayer(playerData)
        playerId = newPlayer.id
        
        // Para jugadores nuevos también podemos mostrar el efecto
        setRecentlyEditedPlayerId(playerId)
        
        // Hacer scroll hacia el jugador nuevo después de un breve delay
        setTimeout(() => {
          const playerElement = document.querySelector(`[data-player-id="${playerId}"]`)
          if (playerElement) {
            playerElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        }, 300)
        
        setTimeout(() => {
          setRecentlyEditedPlayerId(null)
        }, 3000)
      }
      setShowForm(false)
      setEditingPlayer(null)
    } catch (error) {
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setShowForm(true)
  }

  const handleDelete = async (player: Player) => {
    try {
      await deletePlayer(player.id)
    } catch (error) {
      alert("Error al eliminar el jugador")
    }
  }

  const handleViewDetails = (player: Player) => {
    setSelectedPlayer(player)
  }

  const getTeamForPlayer = (teamId?: number) => {
    return teams.find((team) => team.id === teamId)
  }

  const canCreatePlayer = user?.role === "admin" || user?.role === "coach"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />

          {showForm ? (
            <div className="flex justify-center">
              <PlayerForm
                player={editingPlayer || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setEditingPlayer(null)
                }}
                loading={formLoading}
              />
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestión de Jugadores</h1>
                  <p className="text-gray-600 mt-1">Administra los jugadores de tu academia</p>
                  {teamNameFromUrl && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Users className="h-4 w-4 mr-1" />
                        Filtrado por equipo: {teamNameFromUrl}
                      </span>
                      {focusPlayerName && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Enfocando: {focusPlayerName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {canCreatePlayer && (
                  <Button onClick={() => setShowForm(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nuevo Jugador
                  </Button>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar jugadores o padres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={teamFilter?.toString() || "all"}
                  onValueChange={(value) => setTeamFilter(value === "all" ? undefined : Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Todos los equipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los equipos</SelectItem>
                    <SelectItem value="none">Sin equipo</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Todas las posiciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las posiciones</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position || ""}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Team Filter Button */}
              {teamFilter && teamNameFromUrl && (
                <div className="mb-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setTeamFilter(undefined)
                      setTeamNameFromUrl("")
                      setFocusPlayerId(null)
                      setFocusPlayerName("")
                      // Actualizar URL sin recargar la página
                      window.history.pushState({}, '', '/players')
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Ver todos los jugadores
                  </Button>
                  {focusPlayerId && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFocusPlayerId(null)
                        setFocusPlayerName("")
                        // Mantener filtro de equipo pero quitar el foco
                        const url = `/players?team=${teamFilter}&teamName=${encodeURIComponent(teamNameFromUrl)}`
                        window.history.pushState({}, '', url)
                      }}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Quitar foco
                    </Button>
                  )}
                </div>
              )}

              {/* Error State */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="grid-auto-fit">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse card-mobile">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Players Grid */}
                  {filteredPlayers.length > 0 ? (
                    <div className="grid-auto-fit">
                      {filteredPlayers.map((player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          team={getTeamForPlayer(player.team_id)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onViewDetails={handleViewDetails}
                          isFocused={focusPlayerId === player.id}
                          isRecentlyEdited={recentlyEditedPlayerId === player.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Users className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron jugadores</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || teamFilter || positionFilter !== "all"
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Comienza registrando tu primer jugador"}
                      </p>
                      {canCreatePlayer && !searchTerm && !teamFilter && positionFilter === "all" && (
                        <Button onClick={() => setShowForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Primer Jugador
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Player Details Modal */}
        <PlayerDetailsModal
          player={selectedPlayer}
          team={getTeamForPlayer(selectedPlayer?.team_id)}
          open={!!selectedPlayer}
          onOpenChange={(open) => !open && setSelectedPlayer(null)}
        />
      </div>
    </ProtectedRoute>
  )
}

// Nota: revalidate no es compatible con "use client", se removió para evitar errores de build
