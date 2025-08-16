import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"

// Forzamos Node.js runtime porque usamos SQLite (no compatible con Edge Runtime)
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, contraseña y nombre son requeridos" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Por favor ingresa un email válido" }, { status: 400 })
    }

    const user = await authService.register(email, password, name, role)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Registration error:", error)

    let errorMessage = "Error de registro"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
