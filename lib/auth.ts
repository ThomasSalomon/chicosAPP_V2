import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { userRepository } from "./database"
import type { User, AuthUser } from "./types/auth"

const JWT_SECRET = process.env.JWT_SECRET || "dev-local-secret-change"

function mapRow(row: any): User {
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}

export const authService = {
  async register(email: string, password: string, name: string, role: "admin" | "coach" | "parent" = "coach"): Promise<AuthUser> {
    try {
      const existing = await userRepository.findByEmail(email)
      if (existing) throw new Error("El email ya está registrado")

      const passwordHash = await bcrypt.hash(password, 12)
      const user = await userRepository.create(email, name, role, passwordHash)
      
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
      return { ...mapRow(user), token }
    } catch (e) {
      console.error("Registration error:", e)
      throw new Error(e instanceof Error ? e.message : "Error al registrar usuario")
    }
  },
  
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const user = await userRepository.findByEmail(email)
      if (!user) throw new Error("Credenciales inválidas")
      
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) throw new Error("Credenciales inválidas")
      
      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
      return { ...mapRow(user), token }
    } catch (e) {
      console.error("Login error:", e)
      throw new Error(e instanceof Error ? e.message : "Error al iniciar sesión")
    }
  },
  
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      const user = await userRepository.findById(decoded.userId)
      if (!user) return null
      return mapRow(user)
    } catch (e) {
      console.error("Token verification error:", e)
      return null
    }
  },
}
