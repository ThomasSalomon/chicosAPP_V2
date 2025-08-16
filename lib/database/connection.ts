import sqlite3 from "sqlite3"
import path from "path"
import fs from "fs"

// Configuración de la base de datos SQLite
const dbPath = path.join(process.cwd(), "data", "app.db")
const dbDir = path.dirname(dbPath)

// Crear directorio data si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Inicializar base de datos
const db = (() => {
  const instance = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error conectando a SQLite:", err.message)
    } else {
      console.log("Conectado a la base de datos SQLite local")
    }
  })
  instance.configure('busyTimeout', 5000)
  return instance
})()

export const queryCache = new Map<string, any>()
export const CACHE_TTL = 60 * 1000 // 1 minuto

// Promisificar métodos para usar async/await
export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

// Crear tablas si no existen
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

    // Verificar y corregir la estructura de la tabla players
    try {
      const tableInfo = await dbAll("PRAGMA table_info(players)")
      console.log("Estructura actual de la tabla players:", tableInfo.map((col: any) => col.name))
      
      const existingColumns = tableInfo.map((col: any) => col.name)
      const hasAge = existingColumns.includes('age')
      const hasBirthDate = existingColumns.includes('birth_date')
      
      // Si la tabla tiene la columna 'age', necesitamos migración completa
      if (hasAge) {
        console.log("Iniciando migración completa: eliminando dependencia de 'age'...")
        
        // Crear tabla temporal con la nueva estructura (sin age)
        await dbRun(`DROP TABLE IF EXISTS players_migrated`)
        await dbRun(`CREATE TABLE players_migrated (
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
        
        // Migrar datos existentes, calculando birth_date desde age si es necesario
        if (hasBirthDate) {
          // Si ya tiene birth_date, usar ese valor
          await dbRun(`
            INSERT INTO players_migrated (id, name, birth_date, position, team_id, parent_name, parent_phone, parent_email, medical_notes, emergency_contact, emergency_phone, is_active, registration_date, created_at, updated_at)
            SELECT 
              id, 
              name, 
              birth_date,
              position, 
              team_id, 
              parent_name, 
              parent_phone, 
              parent_email, 
              medical_notes, 
              emergency_contact, 
              emergency_phone,
              COALESCE(is_active, 1) as is_active,
              COALESCE(registration_date, CURRENT_TIMESTAMP) as registration_date,
              created_at,
              updated_at
            FROM players
            WHERE birth_date IS NOT NULL AND birth_date != ''
          `)
        } else {
          // Si no tiene birth_date, calcular desde age
          await dbRun(`
            INSERT INTO players_migrated (id, name, birth_date, position, team_id, parent_name, parent_phone, parent_email, medical_notes, emergency_contact, emergency_phone, is_active, registration_date, created_at, updated_at)
            SELECT 
              id, 
              name, 
              DATE('now', '-' || age || ' years') as birth_date,
              position, 
              team_id, 
              parent_name, 
              parent_phone, 
              parent_email, 
              medical_notes, 
              emergency_contact, 
              emergency_phone,
              1 as is_active,
              CURRENT_TIMESTAMP as registration_date,
              created_at,
              updated_at
            FROM players
          `)
        }
        
        // Reemplazar tabla original
        await dbRun(`DROP TABLE players`)
        await dbRun(`ALTER TABLE players_migrated RENAME TO players`)
        
        console.log("✅ Migración completa exitosa: tabla players actualizada sin dependencia de 'age'")
      } else {
        console.log("✅ Tabla players ya tiene la estructura correcta")
      }
      
    } catch (error) {
      console.error("❌ Error en migración de tabla players:", error)
    }

    // Crear índices para mejorar el rendimiento de las búsquedas
    console.log("Creando índices de base de datos...")
    
    // Índices para la tabla teams
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_name ON teams (name)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_category ON teams (category)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_coach_name ON teams (coach_name)`)
    
    // Índices para la tabla players
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_name ON players (name)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_team_id ON players (team_id)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_position ON players (position)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_birth_date ON players (birth_date)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_is_active ON players (is_active)`)
    
    // Índices para la tabla users
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)`)
    
    // Índices compuestos para búsquedas más complejas
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_players_team_active ON players (team_id, is_active)`)
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_teams_category_name ON teams (category, name)`)
    
    console.log("✅ Índices de base de datos creados exitosamente")
    console.log("Tablas inicializadas correctamente")
  } catch (error) {
    console.error("Error inicializando tablas:", error)
  }
}

// Inicializar tablas al cargar el módulo
initTables()

export { db }
