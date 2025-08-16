"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Target, Shield } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to /dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Academia de Fútbol
              <span className="block text-green-600">Sistema de Gestión</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma profesional para la gestión integral de equipos y jugadores en academias de fútbol. Organiza,
              administra y haz seguimiento de tu academia de manera eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/login")} className="text-lg px-8 py-3">
                Iniciar Sesión
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/registro")}
                className="text-lg px-8 py-3"
              >
                Crear Cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Características Principales</h2>
            <p className="text-lg text-gray-600">Todo lo que necesitas para gestionar tu academia de fútbol</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Gestión de Equipos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organiza equipos por categorías, asigna entrenadores y controla la capacidad de jugadores.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Registro de Jugadores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mantén información completa de cada jugador, incluyendo datos de contacto y médicos.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Búsqueda Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Encuentra rápidamente jugadores y equipos con filtros inteligentes y búsqueda por texto.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Control de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sistema de roles para administradores, entrenadores y padres con permisos específicos.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl text-green-100 mb-8">
            Únete a nuestra plataforma y lleva la gestión de tu academia al siguiente nivel.
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push("/registro")} className="text-lg px-8 py-3">
            Comenzar Ahora
          </Button>
        </div>
      </div>
    </div>
  )
}
