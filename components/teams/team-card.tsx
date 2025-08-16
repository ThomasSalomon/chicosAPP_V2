"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Edit, Trash2 } from "lucide-react"
import type { Team } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"

interface TeamCardProps {
  team: Team
  playerCount?: number
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
  onViewPlayers: (team: Team) => void
}

export function TeamCard({ team, playerCount = 0, onEdit, onDelete, onViewPlayers }: TeamCardProps) {
  const { user } = useAuth()
  const canEdit = user?.role === "admin" || user?.role === "coach"
  const canDelete = user?.role === "admin"

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-4 card-mobile">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg transition-colors duration-200 truncate">{team.name}</CardTitle>
            <Badge variant="secondary" className="mt-1 transition-all duration-200 text-xs">
              {team.category}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 ml-2">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(team)}
                className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 touch-target btn-mobile"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(team)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 touch-target btn-mobile"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        {team.coach_name && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Entrenador: {team.coach_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">
            {playerCount}/{team.max_players} jugadores
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden ml-2">
            <div
              className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min((playerCount / team.max_players) * 100, 100)}%` }}
            />
          </div>
        </div>

        {team.description && <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{team.description}</p>}

        <Button
          variant="outline"
          className="w-full mt-3 bg-transparent hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200 touch-target btn-mobile"
          onClick={() => onViewPlayers(team)}
        >
          Ver Jugadores
        </Button>
      </CardContent>
    </Card>
  )
}
