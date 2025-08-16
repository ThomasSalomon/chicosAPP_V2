import { kv } from '@vercel/kv'
import { sql } from '@vercel/postgres'

// Configuración para entorno de producción en Vercel
// Usando Vercel KV para datos simples y PostgreSQL para datos relacionales

interface User {
  id: number
  username: string
  email: string
  password: string
  role: 'admin' | 'coach' | 'parent'
  created_at: string
}

interface Player {
  id: number
  name: string
  birth_date: string
  position: string
  team_id: number
  parent_contact: string
  is_active: boolean
  registration_date: string
}

interface Team {
  id: number
  name: string
  category: string
  coach_id: number
  created_at: string
}

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    if (process.env.POSTGRES_URL) {
      const { rows } = await sql`SELECT * FROM users ORDER BY created_at DESC`
      return rows as User[]
    } else {
      // Fallback a datos en memoria para desarrollo
      return [
        {
          id: 1,
          username: 'admin',
          email: 'admin@academia.com',
          password: '$2b$10$hash', // Hash de 'admin123'
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ]
    }
  } catch (error) {
    console.error('Error getting users:', error)
    return []
  }
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    if (process.env.POSTGRES_URL) {
      const { rows } = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
      return rows[0] as User || null
    } else {
      const users = await getUsers()
      return users.find(u => u.email === email) || null
    }
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

// Funciones para jugadores
export const getPlayers = async (): Promise<Player[]> => {
  try {
    if (process.env.POSTGRES_URL) {
      const { rows } = await sql`SELECT * FROM players ORDER BY name`
      return rows as Player[]
    } else {
      // Datos de demostración
      return [
        {
          id: 1,
          name: 'Carlos Rodríguez',
          birth_date: '2010-03-15',
          position: 'Delantero',
          team_id: 1,
          parent_contact: 'maria.rodriguez@email.com',
          is_active: true,
          registration_date: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Ana García',
          birth_date: '2011-07-22',
          position: 'Mediocampista',
          team_id: 1,
          parent_contact: 'pedro.garcia@email.com',
          is_active: true,
          registration_date: new Date().toISOString()
        }
      ]
    }
  } catch (error) {
    console.error('Error getting players:', error)
    return []
  }
}

// Funciones para equipos
export const getTeams = async (): Promise<Team[]> => {
  try {
    if (process.env.POSTGRES_URL) {
      const { rows } = await sql`SELECT * FROM teams ORDER BY name`
      return rows as Team[]
    } else {
      // Datos de demostración
      return [
        {
          id: 1,
          name: 'Leones Sub-12',
          category: 'Sub-12',
          coach_id: 2,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Águilas Sub-14',
          category: 'Sub-14',
          coach_id: 2,
          created_at: new Date().toISOString()
        }
      ]
    }
  } catch (error) {
    console.error('Error getting teams:', error)
    return []
  }
}

// Función para inicializar tablas en PostgreSQL
export const initVercelTables = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log('No PostgreSQL URL found, using in-memory data')
    return
  }

  try {
    // Crear tabla de usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'coach', 'parent')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Crear tabla de equipos
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        coach_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Crear tabla de jugadores
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        birth_date DATE NOT NULL,
        position VARCHAR(50) NOT NULL,
        team_id INTEGER REFERENCES teams(id),
        parent_contact VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Vercel database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing Vercel tables:', error)
  }
}

// Funciones de utilidad
export const dbRun = async (query: string, params: any[] = []) => {
  if (process.env.POSTGRES_URL) {
    return await sql.query(query, params)
  }
  return { lastID: 0, changes: 0 }
}

export const dbGet = async (query: string, params: any[] = []) => {
  if (process.env.POSTGRES_URL) {
    const result = await sql.query(query, params)
    return result.rows[0] || null
  }
  return null
}

export const dbAll = async (query: string, params: any[] = []) => {
  if (process.env.POSTGRES_URL) {
    const result = await sql.query(query, params)
    return result.rows
  }
  return []
}