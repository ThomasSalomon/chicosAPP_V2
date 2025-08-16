"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/database"

export function usePlayers(teamId?: number, searchTerm?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const params = new URLSearchParams()
      if (teamId) params.append("teamId", teamId.toString())
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/players?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch players")
      }

      const { players } = await response.json()
      setPlayers(players)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch players")
    } finally {
      setLoading(false)
    }
  }

  const createPlayer = async (playerData: Omit<Player, "id" | "created_at" | "updated_at">) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(playerData),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      const { player } = await response.json()
      setPlayers((prev) => [...prev, player])
      return player
    } catch (err) {
      throw err
    }
  }

  const updatePlayer = async (id: number, playerData: Partial<Player>) => {
    try {
      console.log("updatePlayer - ID:", id, "Data:", playerData)
      
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(playerData),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        try {
          const { error } = JSON.parse(errorText)
          throw new Error(error)
        } catch {
          throw new Error(`Server error: ${response.status}`)
        }
      }

      const { player } = await response.json()
      setPlayers((prev) => prev.map((p) => (p.id === id ? player : p)))
      return player
    } catch (err) {
      throw err
    }
  }

  const deletePlayer = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      setPlayers((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    // Debounce optimizado para la búsqueda de texto
    if (searchTerm && searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchPlayers()
      }, 250) // 250ms de debounce optimizado
      
      return () => clearTimeout(timeoutId)
    } else if (searchTerm && searchTerm.length < 2) {
      // Limpiar resultados si el término es muy corto
      setPlayers([])
      setLoading(false)
    } else {
      // Si no hay término de búsqueda, ejecutar inmediatamente
      fetchPlayers()
    }
  }, [teamId, searchTerm])

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  }
}
