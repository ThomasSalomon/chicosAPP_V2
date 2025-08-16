import { type NextRequest, NextResponse } from "next/server"
import { teamRepository } from "@/lib/database"
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

    const team = await teamRepository.findById(Number.parseInt(params.id))
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Get team error:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const team = await teamRepository.update(Number.parseInt(params.id), {
      name,
      category,
      coach_name,
      description,
      max_players,
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error("Update team error:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
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

    const success = await teamRepository.delete(Number.parseInt(params.id))
    if (!success) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Delete team error:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
