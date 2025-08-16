"use client"

import { useState, useEffect } from "react"
import type { Team } from "@/lib/database"

interface TeamWithPlayerCount extends Team {
  playerCount: number
}

export function useTeams(searchTerm?: string) {
  const [teams, setTeams] = useState<TeamWithPlayerCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/teams?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const { teams } = await response.json()
      setTeams(teams)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams")
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (teamData: Omit<Team, "id" | "created_at" | "updated_at">) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      const { team } = await response.json()
      setTeams((prev) => [...prev, team])
      return team
    } catch (err) {
      throw err
    }
  }

  const updateTeam = async (id: number, teamData: Partial<Team>) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`/api/teams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      const { team } = await response.json()
      setTeams((prev) => prev.map((t) => (t.id === id ? team : t)))
      return team
    } catch (err) {
      throw err
    }
  }

  const deleteTeam = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    // Debounce optimizado para la búsqueda de texto
    if (searchTerm && searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchTeams()
      }, 250) // 250ms de debounce optimizado
      
      return () => clearTimeout(timeoutId)
    } else if (searchTerm && searchTerm.length < 2) {
      // Limpiar resultados si el término es muy corto
      setTeams([])
      setLoading(false)
    } else {
      // Si no hay término de búsqueda, ejecutar inmediatamente
      fetchTeams()
    }
  }, [searchTerm])

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  }
}
