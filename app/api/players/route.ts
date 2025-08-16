import { type NextRequest, NextResponse } from "next/server"
import { playerRepository } from "@/lib/database"
import { authService } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const search = searchParams.get("search")

    let players
    if (teamId) {
      players = await playerRepository.getByTeam(Number.parseInt(teamId))
    } else if (search) {
      // Usar búsqueda avanzada para mejores resultados
      players = await playerRepository.searchAdvanced(search)
    } else {
      players = await playerRepository.getAll()
    }

    return NextResponse.json({ players })
  } catch (error) {
    console.error("Get players error:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user || (user.role !== "admin" && user.role !== "coach")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const playerData = await request.json()

    if (!playerData.name || !playerData.birth_date) {
      return NextResponse.json({ error: "Nombre y fecha de nacimiento son obligatorios" }, { status: 400 })
    }

    const player = await playerRepository.create(playerData)

    return NextResponse.json({ player })
  } catch (error) {
    console.error("Create player error:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
