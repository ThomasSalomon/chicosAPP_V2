"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Trophy, UserPlus, TrendingUp, Calendar, Activity } from "lucide-react"

interface DashboardStats {
  totalTeams: number
  totalPlayers: number
  activePlayers: number
  recentRegistrations: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      // Fetch teams
      const teamsResponse = await fetch("/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { teams } = await teamsResponse.json()

      // Fetch players
      const playersResponse = await fetch("/api/players", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { players } = await playersResponse.json()

      // Calculate stats
      const activePlayers = players.filter((p: any) => p.is_active).length
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 30)
      const recentRegistrations = players.filter(
        (p: any) => new Date(p.registration_date) >= recentDate && p.is_active,
      ).length

      setStats({
        totalTeams: teams.length,
        totalPlayers: players.length,
        activePlayers,
        recentRegistrations,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: "Nuevo Jugador",
      description: "Registrar un nuevo jugador",
      icon: UserPlus,
      action: () => router.push("/players?new=true"),
      color: "bg-green-500",
      visible: user?.role === "admin" || user?.role === "coach",
    },
    {
      title: "Nuevo Equipo",
      description: "Crear un nuevo equipo",
      icon: Trophy,
      action: () => router.push("/teams?new=true"),
      color: "bg-blue-500",
      visible: user?.role === "admin" || user?.role === "coach",
    },
    {
      title: "Ver Jugadores",
      description: "Gestionar jugadores",
      icon: Users,
      action: () => router.push("/players"),
      color: "bg-purple-500",
      visible: true,
    },
    {
      title: "Ver Equipos",
      description: "Gestionar equipos",
      icon: Trophy,
      action: () => router.push("/teams"),
      color: "bg-orange-500",
      visible: true,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />

          <PageHeader
            title={`Bienvenido, ${user?.name?.split(" ")[0] || "Usuario"}`}
            description="Aquí tienes un resumen de la actividad de tu academia de fútbol."
          />

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              // Loading skeletons
              [...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalTeams || 0}</div>
                    <p className="text-xs text-muted-foreground">Equipos registrados</p>
                  </CardContent>
                </Card>

                <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-75 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalPlayers || 0}</div>
                    <p className="text-xs text-muted-foreground">Jugadores registrados</p>
                  </CardContent>
                </Card>

                <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-150 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jugadores Activos</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activePlayers || 0}</div>
                    <p className="text-xs text-muted-foreground">Actualmente activos</p>
                  </CardContent>
                </Card>

                <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nuevos (30 días)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.recentRegistrations || 0}</div>
                    <p className="text-xs text-muted-foreground">Registros recientes</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-300">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions
                  .filter((action) => action.visible)
                  .map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-transparent"
                        onClick={action.action}
                      >
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </Button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones en tu academia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Próximamente: Registro de actividad detallado</p>
                <p className="text-sm">Aquí verás las últimas acciones realizadas en el sistema</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
