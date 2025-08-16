import { type NextRequest, NextResponse } from "next/server"
import { playerRepository } from "@/lib/database"
import { authService } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const player = await playerRepository.findById(Number.parseInt(params.id))
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error("Get player error:", error)
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("PUT /api/players/[id] - Iniciando actualización de jugador:", params.id)
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Error: No token de autorización")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user || (user.role !== "admin" && user.role !== "coach")) {
      console.log("Error: Permisos insuficientes. Usuario:", user?.role)
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    console.log("Usuario autorizado:", user.name, user.role)

    const playerData = await request.json()
    console.log("Datos del jugador recibidos:", playerData)

    const playerId = Number.parseInt(params.id)
    console.log("ID del jugador a actualizar:", playerId)

    if (Number.isNaN(playerId)) {
      console.log("Error: ID de jugador inválido")
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 })
    }

    const player = await playerRepository.update(playerId, playerData)
    console.log("Jugador actualizado:", player)

    if (!player) {
      console.log("Error: Jugador no encontrado")
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error("Update player error:", error)
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const success = await playerRepository.delete(Number.parseInt(params.id))
    if (!success) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Player deleted successfully" })
  } catch (error) {
    console.error("Delete player error:", error)
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 })
  }
}
