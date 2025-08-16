"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { TeamCard } from "@/components/teams/team-card"
import { PlayerCard } from "@/components/players/player-card"
import { PlayerDetailsModal } from "@/components/players/player-details-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, Trophy } from "lucide-react"
import type { Player, Team } from "@/lib/database"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      // Search teams
      const teamsResponse = await fetch("/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { teams: allTeamsData } = await teamsResponse.json()
      setAllTeams(allTeamsData)

      const filteredTeams = allTeamsData.filter(
        (team: Team) =>
          team.name.toLowerCase().includes(query.toLowerCase()) ||
          team.category.toLowerCase().includes(query.toLowerCase()) ||
          team.coach_name?.toLowerCase().includes(query.toLowerCase()),
      )

      // Search players
      const playersResponse = await fetch(`/api/players?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { players: searchedPlayers } = await playersResponse.json()

      setTeams(filteredTeams)
      setPlayers(searchedPlayers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la búsqueda")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  const getTeamForPlayer = (teamId?: number) => {
    return allTeams.find((team) => team.id === teamId)
  }

  const handleEditTeam = (team: Team) => {
    // TODO: Implement team editing
    console.log("Edit team:", team.name)
  }

  const handleDeleteTeam = (team: Team) => {
    // TODO: Implement team deletion
    console.log("Delete team:", team.name)
  }

  const handleViewPlayers = (team: Team) => {
    // TODO: Navigate to players filtered by team
    console.log("View players for team:", team.name)
  }

  const handleEditPlayer = (player: Player) => {
    // TODO: Implement player editing
    console.log("Edit player:", player.name)
  }

  const handleDeletePlayer = async (player: Player) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`/api/players/${player.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      // Actualizar la lista de jugadores
      setPlayers(prev => prev.filter(p => p.id !== player.id))
    } catch (error) {
      console.error("Error al eliminar jugador:", error)
      alert("Error al eliminar el jugador")
    }
  }

  const handleViewPlayerDetails = (player: Player) => {
    setSelectedPlayer(player)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />

          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Búsqueda</h1>
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Buscar equipos, jugadores, entrenadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-12 text-lg"
                />
                <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Buscar
                </Button>
              </div>
            </form>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {(teams.length > 0 || players.length > 0) && (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todos ({teams.length + players.length})</TabsTrigger>
                <TabsTrigger value="teams">
                  <Trophy className="h-4 w-4 mr-2" />
                  Equipos ({teams.length})
                </TabsTrigger>
                <TabsTrigger value="players">
                  <Users className="h-4 w-4 mr-2" />
                  Jugadores ({players.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {/* Teams Section */}
                {teams.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Equipos ({teams.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teams.map((team) => (
                        <TeamCard
                          key={team.id}
                          team={team}
                          playerCount={players.filter((p) => p.team_id === team.id).length}
                          onEdit={handleEditTeam}
                          onDelete={handleDeleteTeam}
                          onViewPlayers={handleViewPlayers}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Players Section */}
                {players.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Jugadores ({players.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {players.map((player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          team={getTeamForPlayer(player.team_id)}
                          onEdit={handleEditPlayer}
                          onDelete={handleDeletePlayer}
                          onViewDetails={handleViewPlayerDetails}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="teams">
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        playerCount={players.filter((p) => p.team_id === team.id).length}
                        onEdit={handleEditTeam}
                        onDelete={handleDeleteTeam}
                        onViewPlayers={handleViewPlayers}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
                    <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="players">
                {players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        team={getTeamForPlayer(player.team_id)}
                        onEdit={handleEditPlayer}
                        onDelete={handleDeletePlayer}
                        onViewDetails={handleViewPlayerDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron jugadores</h3>
                    <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* No Results */}
          {!loading && searchQuery && teams.length === 0 && players.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-600 mb-4">No encontramos equipos o jugadores que coincidan con "{searchQuery}"</p>
              <p className="text-sm text-gray-500">Intenta con términos más generales o verifica la ortografía</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Buscando...</p>
            </div>
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
