"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Mail, AlertTriangle, Calendar, Users } from "lucide-react"
import type { Player, Team } from "@/lib/database"
import { calculateAge } from "@/lib/utils"

interface PlayerDetailsModalProps {
  player: Player | null
  team?: Team
  open: boolean
  onOpenChange: (open: boolean) => void
}

const positionLabels = {
  Goalkeeper: "Portero",
  Defender: "Defensor",
  Midfielder: "Mediocampista",
  Forward: "Delantero",
}

export function PlayerDetailsModal({ player, team, open, onOpenChange }: PlayerDetailsModalProps) {
  if (!player) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-lg">
                {getInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{player.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{calculateAge(player.birth_date)} años</Badge>
                {player.position && (
                  <Badge variant="secondary">
                    {positionLabels[player.position as keyof typeof positionLabels] || player.position}
                  </Badge>
                )}
                {!player.is_active && <Badge variant="destructive">Inactivo</Badge>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Information */}
          {team && (
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipo
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-gray-600">Categoría: {team.category}</p>
                {team.coach_name && <p className="text-sm text-gray-600">Entrenador: {team.coach_name}</p>}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(player.parent_name || player.parent_phone || player.parent_email) && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Información de Contacto</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {player.parent_name && (
                  <p>
                    <span className="font-medium">Padre/Madre:</span> {player.parent_name}
                  </p>
                )}
                {player.parent_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{player.parent_phone}</span>
                  </div>
                )}
                {player.parent_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{player.parent_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(player.emergency_contact || player.emergency_phone) && (
            <div>
              <h3 className="font-semibold text-lg mb-2 text-red-600">Contacto de Emergencia</h3>
              <div className="bg-red-50 p-3 rounded-lg space-y-2">
                {player.emergency_contact && (
                  <p>
                    <span className="font-medium">Nombre:</span> {player.emergency_contact}
                  </p>
                )}
                {player.emergency_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-red-500" />
                    <span>{player.emergency_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Information */}
          {player.medical_notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2 text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Información Médica
              </h3>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{player.medical_notes}</p>
              </div>
            </div>
          )}

          {/* Registration Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de Registro
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p>
                <span className="font-medium">Fecha de registro:</span>{" "}
                {player.registration_date ? new Date(player.registration_date).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <Badge variant={player.is_active ? "default" : "destructive"}>
                  {player.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Última actualización:</span>{" "}
                {new Date(player.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
