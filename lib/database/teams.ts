import { dbRun, dbGet, dbAll, queryCache, CACHE_TTL } from "./connection"

export interface Team {
  id: number
  name: string
  category: string
  coach_name?: string
  description?: string
  max_players: number
  created_at: string
  updated_at: string
}

// Helper function to convert SQLite row to Team object
function convertSQLiteToTeam(row: any): Team | null {
  if (!row) return null
  return {
    ...row,
  }
}

export const teamRepository = {
  async findById(id: number): Promise<Team | null> {
    return await dbGet("SELECT * FROM teams WHERE id = ?", [id])
  },

  async create(data: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
    const result = await dbRun(
      "INSERT INTO teams (name, category, coach_name, description, max_players) VALUES (?, ?, ?, ?, ?)",
      [data.name, data.category, data.coach_name || null, data.description || null, data.max_players]
    )
    return await this.findById(result.lastID) as Team
  },

  async update(id: number, data: Partial<Team>): Promise<Team | null> {
    const fields = Object.keys(data).filter(key => key !== 'id').map(key => `${key} = ?`)
    const values = Object.values(data).filter((_, index) => Object.keys(data)[index] !== 'id')
    
    if (fields.length === 0) return await this.findById(id)
    
    await dbRun(
      `UPDATE teams SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    )
    return await this.findById(id)
  },

  async delete(id: number): Promise<boolean> {
    const result = await dbRun("DELETE FROM teams WHERE id = ?", [id])
    return result.changes > 0
  },

  async getAll(): Promise<Team[]> {
    const cacheKey = 'teams_all';
    
    if (queryCache.has(cacheKey)) {
      return queryCache.get(cacheKey);
    }

    const rows = await dbAll("SELECT * FROM teams ORDER BY created_at DESC");
    const data = rows.map(convertSQLiteToTeam).filter(Boolean) as Team[];
    
    queryCache.set(cacheKey, data);
    setTimeout(() => queryCache.delete(cacheKey), CACHE_TTL);
    
    return data;
  },

  async getByCategory(category: string): Promise<Team[]> {
    return await dbAll("SELECT * FROM teams WHERE category = ? ORDER BY name", [category])
  },

  async searchByName(name: string): Promise<Team[]> {
    // Búsqueda optimizada con múltiples criterios y ranking por relevancia
    const searchTerm = `%${name.toLowerCase()}%`
    
    const rows = await dbAll(`
      SELECT *, 
        CASE 
          WHEN LOWER(name) = LOWER(?) THEN 1
          WHEN LOWER(name) LIKE ? THEN 2
          WHEN LOWER(coach_name) LIKE ? THEN 3
          WHEN LOWER(category) LIKE ? THEN 4
          ELSE 5
        END as relevance_score
      FROM teams 
      WHERE LOWER(name) LIKE ? 
         OR LOWER(coach_name) LIKE ?
         OR LOWER(category) LIKE ?
         OR LOWER(description) LIKE ?
      ORDER BY relevance_score, name
    `, [name, `${name.toLowerCase()}%`, searchTerm, searchTerm, 
        searchTerm, searchTerm, searchTerm, searchTerm])
    
    return rows.map(convertSQLiteToTeam).filter(Boolean) as Team[]
  },

  async searchAdvanced(query: string): Promise<Team[]> {
    // Búsqueda avanzada con múltiples campos y filtros
    const searchTerm = `%${query.toLowerCase()}%`
    
    const rows = await dbAll(`
      SELECT *, 
        CASE 
          WHEN LOWER(name) = LOWER(?) THEN 1
          WHEN LOWER(name) LIKE ? THEN 2
          WHEN LOWER(coach_name) LIKE ? THEN 3
          WHEN LOWER(category) LIKE ? THEN 4
          WHEN LOWER(description) LIKE ? THEN 5
          ELSE 6
        END as relevance_score
      FROM teams 
      WHERE LOWER(name) LIKE ? 
         OR LOWER(coach_name) LIKE ?
         OR LOWER(category) LIKE ?
         OR LOWER(description) LIKE ?
      ORDER BY relevance_score, name
      LIMIT 20
    `, [query, `${query.toLowerCase()}%`, searchTerm, searchTerm, searchTerm,
        searchTerm, searchTerm, searchTerm, searchTerm])
    
    return rows.map(convertSQLiteToTeam).filter(Boolean) as Team[]
  }
}
