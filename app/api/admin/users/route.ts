import { NextRequest, NextResponse } from "next/server"
import { userRepository } from "@/lib/database/users"

export async function GET() {
  try {
    const users = await userRepository.getAll()
    console.log("Usuarios encontrados:", users)
    
    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID de usuario requerido" },
        { status: 400 }
      )
    }

    const updatedUser = await userRepository.update(userId, { role: "admin" })
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${updatedUser.name} ahora es administrador`,
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}
