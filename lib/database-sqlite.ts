import sqlite3 from "sqlite3"
import path from "path"
import fs from "fs"

// Inicializar/crear base de datos SQLite local
const dbPath = path.join(process.cwd(), "data", "app.db")
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

const db = new sqlite3.Database(dbPath)

// Promisificar métodos de la base de datos para usar async/await
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
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

// Inicializar todas las tablas
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
      age INTEGER NOT NULL,
      position TEXT,
      team_id INTEGER,
      parent_name TEXT,
      parent_phone TEXT,
      parent_email TEXT,
      medical_notes TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams (id)
    )`)

    console.log("Base de datos SQLite inicializada correctamente")
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
  }
}

// Ejecutar inicialización
initTables()

export { db }
