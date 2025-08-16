"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, LoginCredentials, RegisterData, AuthContextType } from "@/lib/types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const { user } = await response.json()
        setUser(user)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("auth_token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return { success: false, error: "Error del servidor. Por favor, intenta de nuevo." }
      }

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Error de inicio de sesión" }
      }

      // Guardar el token y el usuario
      const token = data.user.token
      localStorage.setItem("auth_token", token)
      
      // Establecer el usuario en el estado
      setUser(data.user)
      
      // Verificar que el token sea válido
      await verifyToken(token)
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: "Error de conexión. Por favor, verifica tu conexión a internet." }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "coach" }),
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return { success: false, error: "Error del servidor. Por favor, intenta de nuevo." }
      }

      const responseData = await response.json()

      if (!response.ok) {
        return { success: false, error: responseData.error || "Error de registro" }
      }

      localStorage.setItem("auth_token", responseData.user.token)
      setUser(responseData.user)
      return { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: "Error de conexión. Por favor, verifica tu conexión a internet." }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
