import { dbRun, dbGet, dbAll } from "./adaptive-connection"

export interface User {
  id: number
  email: string
  name: string
  role: "admin" | "coach" | "parent"
  password_hash: string
  created_at: string
  updated_at: string
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return await dbGet("SELECT * FROM users WHERE email = ?", [email])
  },

  async findById(id: number): Promise<User | null> {
    return await dbGet("SELECT * FROM users WHERE id = ?", [id])
  },

  async create(email: string, name: string, role: string, passwordHash: string): Promise<User> {
    const result = await dbRun(
      "INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)",
      [email, name, role, passwordHash]
    )
    return await this.findById(result.lastID) as User
  },

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const fields = Object.keys(data).filter(key => key !== 'id').map(key => `${key} = ?`)
    const values = Object.values(data).filter((_, index) => Object.keys(data)[index] !== 'id')
    
    if (fields.length === 0) return await this.findById(id)
    
    await dbRun(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    )
    return await this.findById(id)
  },

  async delete(id: number): Promise<boolean> {
    const result = await dbRun("DELETE FROM users WHERE id = ?", [id])
    return result.changes > 0
  },

  async getAll(): Promise<User[]> {
    return await dbAll("SELECT * FROM users ORDER BY created_at DESC")
  }
}
