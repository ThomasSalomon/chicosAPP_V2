import { type NextRequest, NextResponse } from "next/server"
import { teamRepository, playerRepository } from "@/lib/database"
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
    const search = searchParams.get("search")

    let teams
    if (search) {
      // Usar búsqueda avanzada para mejores resultados
      teams = await teamRepository.searchAdvanced(search)
    } else {
      teams = await teamRepository.getAll()
    }
    
    // Obtener el conteo de jugadores para cada equipo
    const teamsWithPlayerCount = await Promise.all(
      teams.map(async (team) => {
        const players = await playerRepository.getByTeam(team.id)
        return {
          ...team,
          playerCount: players.length
        }
      })
    )
    
    return NextResponse.json({ teams: teamsWithPlayerCount })
  } catch (error) {
    console.error("Get teams error:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
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

    const { name, category, coach_name, description, max_players } = await request.json()

    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }

    const team = await teamRepository.create({
      name,
      category,
      coach_name,
      description,
      max_players: max_players || 25,
    })

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Create team error:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
