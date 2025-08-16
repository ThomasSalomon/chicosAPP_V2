"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  onToggleMode?: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"admin" | "coach" | "parent">("coach")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await register({ email, password, name })
      if (result.success) {
        setSuccess(true)
        
        // Contador regresivo
        let count = 3
        setCountdown(count)
        
        const countdownInterval = setInterval(() => {
          count--
          setCountdown(count)
          
          if (count === 0) {
            clearInterval(countdownInterval)
            router.push("/login")
          }
        }, 1000)
      } else {
        setError(result.error || "Error en el registro")
      }
    } catch (err) {
      setError("Error en el registro")
      console.error('Error detallado:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription>Únete a nuestra Academia de Fútbol</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>
                ✅ ¡Cuenta creada exitosamente! Serás redirigido al login en {countdown} segundo{countdown !== 1 ? 's' : ''}...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tu nombre completo"
              disabled={success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              disabled={success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              disabled={success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value: "admin" | "coach" | "parent") => setRole(value)} disabled={success}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coach">Entrenador</SelectItem>
                <SelectItem value="parent">Padre/Madre</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading || success}>
            {success ? "¡Cuenta creada! Redirigiendo..." : loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <div className="text-center">
            {onToggleMode ? (
              <Button type="button" variant="link" className="text-sm" onClick={onToggleMode}>
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            ) : (
              <Link href="/login">
                <Button type="button" variant="link" className="text-sm">
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </Link>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
