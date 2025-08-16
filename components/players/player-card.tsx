"use client"

import React from "react"
import dynamic from 'next/dynamic'
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Phone, Mail, AlertTriangle, Edit, Trash2, Calendar } from "lucide-react"
import type { Player, Team } from "@/lib/database"
import { calculateAge } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const PlayerDetailsModal = dynamic(() => import("./player-details-modal").then(mod => ({ default: mod.PlayerDetailsModal })), {
  loading: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>,
  ssr: false
})

interface PlayerCardProps {
  player: Player
  team?: Team
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
  onViewDetails: (player: Player) => void
  isFocused?: boolean
  isRecentlyEdited?: boolean
}

const positionColors = {
  Goalkeeper: "bg-yellow-100 text-yellow-800",
  Defender: "bg-blue-100 text-blue-800",
  Midfielder: "bg-green-100 text-green-800",
  Forward: "bg-red-100 text-red-800",
}

const positionLabels = {
  Goalkeeper: "Portero",
  Defender: "Defensor",
  Midfielder: "Mediocampista",
  Forward: "Delantero",
}

export function PlayerCard({ player, team, onEdit, onDelete, onViewDetails, isFocused = false, isRecentlyEdited = false }: PlayerCardProps) {
  const { user } = useAuth()
  const canEdit = user?.role === "admin" || user?.role === "coach"
  const canDelete = user?.role === "admin"

  const handleDeleteConfirm = () => {
    onDelete(player)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateDaysSinceRegistration = (registrationDate: string) => {
    const today = new Date()
    const regDate = new Date(registrationDate)
    const diffTime = Math.abs(today.getTime() - regDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div data-player-id={player.id}>
      <Card className={`transition-all duration-700 card-mobile ${
        isFocused 
          ? "shadow-2xl ring-4 ring-green-400 ring-opacity-75 bg-green-50 transform scale-105 animate-pulse" 
          : isRecentlyEdited
          ? "shadow-2xl ring-4 ring-blue-500 ring-opacity-90 bg-gradient-to-br from-blue-50 to-indigo-50 transform scale-105"
          : "hover:shadow-lg"
      }`}>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        {isFocused && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white animate-bounce">
              <span className="h-2 w-2 bg-white rounded-full mr-1"></span>
              ¡Jugador encontrado!
            </span>
          </div>
        )}
        {isRecentlyEdited && (
          <div className="mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse">
              <span className="h-2 w-2 bg-white rounded-full mr-2 animate-ping"></span>
              ¡Actualizado exitosamente!
            </span>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{player.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{calculateAge(player.birth_date)} años</Badge>
                {player.position && (
                  <Badge
                    className={
                      positionColors[player.position as keyof typeof positionColors] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {positionLabels[player.position as keyof typeof positionLabels] || player.position}
                  </Badge>
                )}
                {!player.is_active && <Badge variant="destructive">Inactivo</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(player)} className="touch-target btn-mobile">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 touch-target btn-mobile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente el jugador{" "}
                      <span className="font-medium">"{player.name}"</span> de la base de datos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Eliminar jugador
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        {team && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="secondary">{team.name}</Badge>
            <span className="text-xs">({team.category})</span>
          </div>
        )}

        {player.parent_name && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Contacto:</p>
            <p className="text-sm text-gray-600">{player.parent_name}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {player.parent_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{player.parent_phone}</span>
                </div>
              )}
              {player.parent_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{player.parent_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {player.medical_notes && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Tiene notas médicas</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Registrado: {player.registration_date ? new Date(player.registration_date).toLocaleDateString() : "N/A"}</span>
          <span>({player.registration_date ? calculateDaysSinceRegistration(player.registration_date) : 0} días)</span>
        </div>

        <Button variant="outline" className="w-full mt-3 bg-transparent touch-target btn-mobile" onClick={() => onViewDetails(player)}>
          Ver Detalles
        </Button>
      </CardContent>
    </Card>
    </div>
  )
}
