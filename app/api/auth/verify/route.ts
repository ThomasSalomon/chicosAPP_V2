import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token es requerido" }, { status: 400 })
    }

    const user = await authService.verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Error de verificación de token" }, { status: 401 })
  }
}
