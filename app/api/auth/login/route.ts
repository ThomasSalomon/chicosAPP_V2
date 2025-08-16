import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = await authService.login(email, password)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)

    let errorMessage = "Error de inicio de sesión"

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 401 })
  }
}
