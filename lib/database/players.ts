import { dbRun, dbGet, dbAll, queryCache, CACHE_TTL } from "./connection"

export interface Player {
  id: number
  name: string
  birth_date: string
  age?: number // Campo calculado, no se almacena en la BD
  position?: string
  team_id?: number
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  medical_notes?: string
  emergency_contact?: string
  emergency_phone?: string
  is_active?: boolean
  registration_date?: string
  created_at: string
  updated_at: string
}

// Helper function to convert SQLite row to Player object
function convertSQLiteToPlayer(row: any): Player | null {
  if (!row) return null
  return {
    ...row,
    is_active: row.is_active === 1,
  }
}

export const playerRepository = {
  async findById(id: number): Promise<Player | null> {
    const row = await dbGet("SELECT * FROM players WHERE id = ?", [id])
    return convertSQLiteToPlayer(row)
  },

  async create(data: Omit<Player, 'id' | 'created_at' | 'updated_at' | 'age'>): Promise<Player> {
    const result = await dbRun(
      `INSERT INTO players (name, birth_date, position, team_id, parent_name, parent_phone, parent_email, medical_notes, emergency_contact, emergency_phone, is_active, registration_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.birth_date,
        data.position || null,
        data.team_id || null,
        data.parent_name || null,
        data.parent_phone || null,
        data.parent_email || null,
        data.medical_notes || null,
        data.emergency_contact || null,
        data.emergency_phone || null,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1, // Default activo
        data.registration_date || new Date().toISOString().split('T')[0]
      ]
    )
    const player = await this.findById(result.lastID)
    return convertSQLiteToPlayer(player) as Player
  },

  async update(id: number, data: Partial<Player>): Promise<Player | null> {
    try {
      // Filtrar campos válidos y evitar id, created_at, updated_at, age (calculado), registration_date (solo en creación)
      const validFields = ['name', 'birth_date', 'position', 'team_id', 'parent_name', 'parent_phone', 'parent_email', 'medical_notes', 'emergency_contact', 'emergency_phone', 'is_active']
      const filteredData = Object.keys(data)
        .filter(key => validFields.includes(key) && data[key as keyof Player] !== undefined)
        .reduce((obj, key) => {
          let value = data[key as keyof Player]
          // Convertir booleanos a integers para SQLite
          if (key === 'is_active' && typeof value === 'boolean') {
            value = value ? 1 : 0
          }
          obj[key] = value
          return obj
        }, {} as any)
      
      if (Object.keys(filteredData).length === 0) {
        return await this.findById(id)
      }
      
      const fields = Object.keys(filteredData).map(key => `${key} = ?`)
      const values = Object.values(filteredData)
      
      const sql = `UPDATE players SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      
      await dbRun(sql, [...values, id])
      const updatedPlayer = await this.findById(id)
      
      return updatedPlayer
    } catch (error) {
      console.error("Error en playerRepository.update:", error)
      throw error
    }
  },

  async delete(id: number): Promise<boolean> {
    const result = await dbRun("DELETE FROM players WHERE id = ?", [id])
    return result.changes > 0
  },

  async getAll(): Promise<Player[]> {
    const cacheKey = 'players_all';
    
    if (queryCache.has(cacheKey)) {
      return queryCache.get(cacheKey);
    }

    const rows = await dbAll("SELECT * FROM players ORDER BY name");
    const data = rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[];
    
    queryCache.set(cacheKey, data);
    setTimeout(() => queryCache.delete(cacheKey), CACHE_TTL);
    
    return data;
  },

  async getByTeam(teamId: number): Promise<Player[]> {
    const rows = await dbAll("SELECT * FROM players WHERE team_id = ? ORDER BY name", [teamId])
    return rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[]
  },

  async getWithoutTeam(): Promise<Player[]> {
    const rows = await dbAll("SELECT * FROM players WHERE team_id IS NULL ORDER BY name")
    return rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[]
  },

  async searchByName(name: string): Promise<Player[]> {
    // Búsqueda optimizada con múltiples criterios y ranking por relevancia
    const searchTerm = `%${name.toLowerCase()}%`
    
    const rows = await dbAll(`
      SELECT *, 
        CASE 
          WHEN LOWER(name) = LOWER(?) THEN 1
          WHEN LOWER(name) LIKE ? THEN 2
          WHEN LOWER(parent_name) LIKE ? THEN 3
          ELSE 4
        END as relevance_score
      FROM players 
      WHERE LOWER(name) LIKE ? 
         OR LOWER(parent_name) LIKE ?
         OR LOWER(position) LIKE ?
      ORDER BY relevance_score, name
    `, [name, `${name.toLowerCase()}%`, searchTerm, searchTerm, searchTerm, searchTerm])
    
    return rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[]
  },

  async searchAdvanced(query: string): Promise<Player[]> {
    // Búsqueda avanzada con múltiples campos y filtros
    const searchTerm = `%${query.toLowerCase()}%`
    
    const rows = await dbAll(`
      SELECT p.*, 
        CASE 
          WHEN LOWER(p.name) = LOWER(?) THEN 1
          WHEN LOWER(p.name) LIKE ? THEN 2
          WHEN LOWER(p.parent_name) LIKE ? THEN 3
          WHEN LOWER(p.position) LIKE ? THEN 4
          WHEN LOWER(p.emergency_contact) LIKE ? THEN 5
          ELSE 6
        END as relevance_score
      FROM players p
      WHERE p.is_active = 1 AND (
        LOWER(p.name) LIKE ? 
        OR LOWER(p.parent_name) LIKE ?
        OR LOWER(p.position) LIKE ?
        OR LOWER(p.emergency_contact) LIKE ?
        OR LOWER(p.parent_email) LIKE ?
      )
      ORDER BY relevance_score, p.name
      LIMIT 50
    `, [query, `${query.toLowerCase()}%`, searchTerm, searchTerm, searchTerm, 
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm])
    
    return rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[]
  },

  async getByAgeRange(minAge: number, maxAge: number): Promise<Player[]> {
    // Calcular las fechas de nacimiento correspondientes a las edades
    const today = new Date()
    const maxBirthDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    const minBirthDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    
    const rows = await dbAll(
      "SELECT * FROM players WHERE birth_date BETWEEN ? AND ? ORDER BY birth_date DESC, name", 
      [minBirthDate, maxBirthDate]
    )
    return rows.map(convertSQLiteToPlayer).filter(Boolean) as Player[]
  },

  async assignToTeam(playerId: number, teamId: number): Promise<Player | null> {
    await dbRun("UPDATE players SET team_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [teamId, playerId])
    return await this.findById(playerId)
  },

  async removeFromTeam(playerId: number): Promise<Player | null> {
    await dbRun("UPDATE players SET team_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [playerId])
    return await this.findById(playerId)
  }
}
