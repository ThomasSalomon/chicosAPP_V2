"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Database, Users, Trophy, AlertCircle, CheckCircle, Trash2 } from "lucide-react"

interface SeedResult {
  success: boolean
  message: string
  teams?: number
  players?: number
  deletedTeams?: number
  deletedPlayers?: number
  error?: string
  details?: Array<{
    teamName: string
    teamId: number
    playersCount: number
    coach: string
    category: string
  }>
  summary?: {
    teamsFound: number
    playersFound: number
    teamsDeleted: number
    playersDeleted: number
  }
}

export default function AdminSeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SeedResult | null>(null)
  const [users, setUsers] = useState<any[]>([])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    }
  }

  const makeAdmin = async (userId: number) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      
      if (response.ok) {
        alert("Usuario actualizado a administrador")
        loadUsers() // Recargar usuarios
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSeedData = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Error al conectar con el servidor",
        teams: 0,
        players: 0,
        error: error instanceof Error ? error.message : "Error desconocido"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = async () => {
    const confirmed = confirm(
      "⚠️ ADVERTENCIA ⚠️\n\n" +
      "¿Estás seguro de que quieres eliminar TODOS los equipos y jugadores?\n\n" +
      "Esta acción:\n" +
      "• Eliminará TODOS los equipos\n" +
      "• Eliminará TODOS los jugadores\n" +
      "• NO se puede deshacer\n\n" +
      "¿Continuar?"
    )
    
    if (!confirmed) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/clear-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        console.log("🎉 Datos eliminados exitosamente:", data)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error al conectar con el servidor para eliminar datos",
        error: error instanceof Error ? error.message : "Error desconocido"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Administración - Datos de Prueba
        </h1>
        <p className="text-gray-600">
          Utiliza esta página para inyectar datos de prueba en la aplicación.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Inyección de Datos de Prueba
            </CardTitle>
            <CardDescription>
              Genera automáticamente 10 equipos con 20 jugadores cada uno para probar la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información de lo que se va a crear */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">10 Equipos</h3>
                  <p className="text-sm text-blue-700">Con nombres realistas y entrenadores</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">200 Jugadores</h3>
                  <p className="text-sm text-green-700">20 jugadores por equipo con datos completos</p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <Button
                onClick={handleSeedData}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Inyectando datos...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Inyectar Datos de Prueba
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearData}
                disabled={isLoading}
                variant="destructive"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Eliminando datos...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpiar Datos
                  </>
                )}
              </Button>
            </div>

            {/* Resultado */}
            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.success && result.teams && result.players && (
                      <div className="mt-2">
                        <p className="text-sm">
                          Se crearon {result.teams} equipos y {result.players} jugadores exitosamente.
                        </p>
                        {result.details && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Equipos creados:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {result.details.map((team, index) => (
                                <div key={team.teamId} className="bg-white p-2 rounded border">
                                  <p className="font-medium">{team.teamName}</p>
                                  <p className="text-gray-600">
                                    {team.playersCount} jugadores • {team.category}
                                  </p>
                                  <p className="text-gray-500">Entrenador: {team.coach}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {result.success && result.deletedTeams !== undefined && result.deletedPlayers !== undefined && (
                      <div className="mt-2">
                        <p className="text-sm">
                          Se eliminaron {result.deletedTeams} equipos y {result.deletedPlayers} jugadores exitosamente.
                        </p>
                        {result.summary && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm font-medium mb-2">Resumen de limpieza:</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-gray-600">Equipos encontrados: <span className="font-medium">{result.summary.teamsFound}</span></p>
                                <p className="text-gray-600">Equipos eliminados: <span className="font-medium">{result.summary.teamsDeleted}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Jugadores encontrados: <span className="font-medium">{result.summary.playersFound}</span></p>
                                <p className="text-gray-600">Jugadores eliminados: <span className="font-medium">{result.summary.playersDeleted}</span></p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {result.error && (
                      <p className="text-sm mt-1">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={loadUsers} variant="outline">
                Cargar Usuarios
              </Button>
              
              {users.length > 0 && (
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      {user.role !== 'admin' && (
                        <Button 
                          onClick={() => makeAdmin(user.id)}
                          size="sm"
                          variant="outline"
                        >
                          Hacer Admin
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información sobre los datos generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Equipos:</strong> Se crearán 10 equipos con nombres como "Leones FC", "Águilas United", etc.
              </div>
              <div>
                <strong>Categorías:</strong> Aleatoriamente asignadas entre Sub-8, Sub-10, Sub-12, Sub-14, Sub-16.
              </div>
              <div>
                <strong>Jugadores:</strong> Nombres colombianos realistas, edades entre 6-13 años, posiciones aleatorias.
              </div>
              <div>
                <strong>Datos de contacto:</strong> Teléfonos y emails ficticios pero con formato realista.
              </div>
              <div>
                <strong>Entrenadores:</strong> Cada equipo tendrá un entrenador asignado.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
