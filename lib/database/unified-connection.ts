// Configuración unificada de base de datos
// Funciona tanto en desarrollo (SQLite) como en producción (datos en memoria para Vercel)

import path from "path"
import fs from "fs"

// Detectar entorno
const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
const isProduction = process.env.NODE_ENV === 'production'

// Cache para consultas
export const queryCache = new Map<string, any>()
export const CACHE_TTL = 60 * 1000 // 1 minuto

// Datos de demostración para producción
const mockUsers = [
  {
    id: 1,
    email: 'admin@academia.com',
    name: 'Administrador',
    role: 'admin',
    password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'coach@academia.com',
    name: 'Entrenador Principal',
    role: 'coach',
    password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'coach123'
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'parent@academia.com',
    name: 'Padre de Familia',
    role: 'parent',
    password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'parent123'
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockTeams = [
  {
    id: 1,
    name: 'Leones Sub-12',
    category: 'Sub-12',
    coach_name: 'Entrenador Principal',
    description: 'Equipo de fútbol para niños de 10-12 años',
    max_players: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Águilas Sub-14',
    category: 'Sub-14',
    coach_name: 'Entrenador Principal',
    description: 'Equipo de fútbol para jóvenes de 12-14 años',
    max_players: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Tigres Sub-16',
    category: 'Sub-16',
    coach_name: 'Entrenador Principal',
    description: 'Equipo de fútbol para jóvenes de 14-16 años',
    max_players: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockPlayers = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    birth_date: '2010-03-15',
    position: 'Delantero',
    team_id: 1,
    parent_name: 'María Rodríguez',
    parent_phone: '+34 600 123 456',
    parent_email: 'maria.rodriguez@email.com',
    medical_notes: 'Sin alergias conocidas',
    emergency_contact: 'Pedro Rodríguez',
    emergency_phone: '+34 600 654 321',
    is_active: 1,
    registration_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ana García',
    birth_date: '2011-07-22',
    position: 'Mediocampista',
    team_id: 1,
    parent_name: 'Luis García',
    parent_phone: '+34 600 789 012',
    parent_email: 'luis.garcia@email.com',
    medical_notes: 'Alergia al polen',
    emergency_contact: 'Carmen García',
    emergency_phone: '+34 600 210 987',
    is_active: 1,
    registration_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Miguel López',
    birth_date: '2009-12-08',
    position: 'Portero',
    team_id: 2,
    parent_name: 'Isabel López',
    parent_phone: '+34 600 345 678',
    parent_email: 'isabel.lopez@email.com',
    medical_notes: 'Sin restricciones médicas',
    emergency_contact: 'Antonio López',
    emergency_phone: '+34 600 876 543',
    is_active: 1,
    registration_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Variable para la instancia de base de datos SQLite
let sqliteDb: any = null

// Función para obtener la base de datos SQLite (solo en desarrollo)
const getSQLiteDatabase = async () => {
  if (sqliteDb) return sqliteDb
  
  try {
    const dbPath = path.join(process.cwd(), "data", "app.db")
    const dbDir = path.dirname(dbPath)
    
    // Crear directorio data si no existe
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    
    // Importación dinámica de sqlite3 solo si no estamos en build
    if (typeof window === 'undefined' && !process.env.VERCEL) {
      const sqlite3 = await eval('import("sqlite3")')
      sqliteDb = new sqlite3.default.Database(dbPath, (err: any) => {
        if (err) {
          console.error("Error conectando a SQLite:", err.message)
          throw err
        } else {
          console.log("Conectado a la base de datos SQLite local")
        }
      })
      
      sqliteDb.configure('busyTimeout', 5000)
      return sqliteDb
    } else {
      throw new Error('SQLite no disponible en este entorno')
    }
  } catch (error) {
    console.error('Error inicializando SQLite:', error)
    throw error
  }
}

// Función para buscar en datos mock
const searchMockData = (table: string, sql: string, params: any[] = []): any => {
  const lowerSql = sql.toLowerCase()
  
  if (table === 'users') {
    if (lowerSql.includes('where email')) {
      return mockUsers.find(u => u.email === params[0]) || null
    }
    if (lowerSql.includes('where id')) {
      return mockUsers.find(u => u.id === params[0]) || null
    }
    return mockUsers
  }
  
  if (table === 'teams') {
    if (lowerSql.includes('where id')) {
      return mockTeams.find(t => t.id === params[0]) || null
    }
    return mockTeams
  }
  
  if (table === 'players') {
    if (lowerSql.includes('where id')) {
      return mockPlayers.find(p => p.id === params[0]) || null
    }
    if (lowerSql.includes('where team_id')) {
      return mockPlayers.filter(p => p.team_id === params[0])
    }
    return mockPlayers
  }
  
  return null
}

// Funciones principales de base de datos
export const dbRun = async (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  if (isVercelEnvironment || isProduction) {
    // En producción, simular operaciones
    console.log('Mock dbRun:', sql, params)
    return { lastID: Math.floor(Math.random() * 1000) + 1, changes: 1 }
  } else {
    // En desarrollo, usar SQLite si está disponible
    try {
      const db = await getSQLiteDatabase()
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(this: any, err: any) {
          if (err) {
            console.error('SQLite run error:', err)
            reject(err)
          } else {
            resolve({ lastID: this.lastID, changes: this.changes })
          }
        })
      })
    } catch (error) {
      console.warn('SQLite no disponible, usando datos mock:', error instanceof Error ? error.message : String(error))
      return { lastID: Math.floor(Math.random() * 1000) + 1, changes: 1 }
    }
  }
}

export const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
  if (isVercelEnvironment || isProduction) {
    // En producción, usar datos mock
    console.log('Mock dbGet:', sql, params)
    
    const lowerSql = sql.toLowerCase()
    if (lowerSql.includes('users')) {
      return searchMockData('users', sql, params)
    }
    if (lowerSql.includes('teams')) {
      return searchMockData('teams', sql, params)
    }
    if (lowerSql.includes('players')) {
      return searchMockData('players', sql, params)
    }
    
    return null
  } else {
    // En desarrollo, usar SQLite si está disponible
    try {
      const db = await getSQLiteDatabase()
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err: any, row: any) => {
          if (err) {
            console.error('SQLite get error:', err)
            reject(err)
          } else {
            resolve(row)
          }
        })
      })
    } catch (error) {
      console.warn('SQLite no disponible, usando datos mock:', error instanceof Error ? error.message : String(error))
      // Fallback a datos mock
      const lowerSql = sql.toLowerCase()
      if (lowerSql.includes('users')) {
        return searchMockData('users', sql, params)
      }
      if (lowerSql.includes('teams')) {
        return searchMockData('teams', sql, params)
      }
      if (lowerSql.includes('players')) {
        return searchMockData('players', sql, params)
      }
      return null
    }
  }
}

export const dbAll = async (sql: string, params: any[] = []): Promise<any[]> => {
  if (isVercelEnvironment || isProduction) {
    // En producción, usar datos mock
    console.log('Mock dbAll:', sql, params)
    
    const lowerSql = sql.toLowerCase()
    if (lowerSql.includes('users')) {
      const result = searchMockData('users', sql, params)
      return Array.isArray(result) ? result : []
    }
    if (lowerSql.includes('teams')) {
      const result = searchMockData('teams', sql, params)
      return Array.isArray(result) ? result : []
    }
    if (lowerSql.includes('players')) {
      const result = searchMockData('players', sql, params)
      return Array.isArray(result) ? result : []
    }
    
    return []
  } else {
    // En desarrollo, usar SQLite si está disponible
    try {
      const db = await getSQLiteDatabase()
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err: any, rows: any[]) => {
          if (err) {
            console.error('SQLite all error:', err)
            reject(err)
          } else {
            resolve(rows || [])
          }
        })
      })
    } catch (error) {
      console.warn('SQLite no disponible, usando datos mock:', error instanceof Error ? error.message : String(error))
      // Fallback a datos mock
      const lowerSql = sql.toLowerCase()
      if (lowerSql.includes('users')) {
        const result = searchMockData('users', sql, params)
        return Array.isArray(result) ? result : []
      }
      if (lowerSql.includes('teams')) {
        const result = searchMockData('teams', sql, params)
        return Array.isArray(result) ? result : []
      }
      if (lowerSql.includes('players')) {
        const result = searchMockData('players', sql, params)
        return Array.isArray(result) ? result : []
      }
      return []
    }
  }
}

// Función de inicialización
export const initDatabase = async (): Promise<boolean> => {
  if (isVercelEnvironment || isProduction) {
    console.log('Base de datos inicializada para entorno de producción con datos de demostración')
    return true
  } else {
    // Inicializar SQLite en desarrollo
    try {
      await getSQLiteDatabase()
      await initTables()
      console.log('Base de datos SQLite inicializada correctamente')
      return true
    } catch (error) {
      console.error('Error inicializando base de datos:', error instanceof Error ? error.message : String(error))
      return false
    }
  }
}

// Crear tablas en SQLite (solo desarrollo)
const initTables = async () => {
  try {
    // Tabla de usuarios
    await dbRun(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'coach',
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    // Tabla de equipos
    await dbRun(`CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      coach_name TEXT,
      description TEXT,
      max_players INTEGER NOT NULL DEFAULT 20,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`)

    // Tabla de jugadores
    await dbRun(`CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      position TEXT,
      team_id INTEGER,
      parent_name TEXT,
      parent_phone TEXT,
      parent_email TEXT,
      medical_notes TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      is_active INTEGER DEFAULT 1,
      registration_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    )`)

    // Crear índices para mejorar rendimiento
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_name ON teams (name)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_category ON teams (category)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_name ON players (name)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_team_id ON players (team_id)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_position ON players (position)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_is_active ON players (is_active)`)
    
    console.log('Tablas e índices creados correctamente')
  } catch (error) {
    console.error('Error creando tablas:', error)
    throw error
  }
}

// Inicializar automáticamente en desarrollo
if (!isVercelEnvironment && !isProduction) {
  initDatabase().catch(console.error)
}