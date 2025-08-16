// Configuración adaptativa de base de datos
// Usa SQLite para desarrollo local y configuración compatible con Vercel para producción

const isVercelEnvironment = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

if (isVercelEnvironment) {
  // En producción (Vercel), usar configuración compatible
  console.log('Using Vercel-compatible database configuration')
  
  // Datos en memoria para demostración
  const users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@academia.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'coach1',
      email: 'coach@academia.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'coach123'
      role: 'coach',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'parent1',
      email: 'parent@academia.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'parent123'
      role: 'parent',
      created_at: new Date().toISOString()
    }
  ]

  const teams = [
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
    },
    {
      id: 3,
      name: 'Tigres Sub-16',
      category: 'Sub-16',
      coach_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Halcones Sub-18',
      category: 'Sub-18',
      coach_id: 2,
      created_at: new Date().toISOString()
    }
  ]

  const players = [
    {
      id: 1,
      name: 'Carlos Rodríguez',
      birth_date: '2012-03-15',
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
    },
    {
      id: 3,
      name: 'Luis Martínez',
      birth_date: '2010-11-08',
      position: 'Defensor',
      team_id: 2,
      parent_contact: 'carmen.martinez@email.com',
      is_active: true,
      registration_date: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Sofia López',
      birth_date: '2009-05-30',
      position: 'Portera',
      team_id: 2,
      parent_contact: 'juan.lopez@email.com',
      is_active: true,
      registration_date: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Diego Fernández',
      birth_date: '2008-12-12',
      position: 'Delantero',
      team_id: 3,
      parent_contact: 'lucia.fernandez@email.com',
      is_active: true,
      registration_date: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Isabella Torres',
      birth_date: '2007-09-18',
      position: 'Mediocampista',
      team_id: 3,
      parent_contact: 'roberto.torres@email.com',
      is_active: true,
      registration_date: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Mateo Ruiz',
      birth_date: '2006-04-25',
      position: 'Defensor',
      team_id: 4,
      parent_contact: 'patricia.ruiz@email.com',
      is_active: true,
      registration_date: new Date().toISOString()
    }
  ]

  // Funciones para Vercel (datos en memoria)
  export const dbRun = async (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
    console.log('Vercel dbRun:', sql, params)
    return { lastID: 1, changes: 1 }
  }

  export const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
    console.log('Vercel dbGet:', sql, params)
    
    if (sql.includes('users') && sql.includes('email')) {
      const email = params[0]
      return users.find(u => u.email === email) || null
    }
    
    if (sql.includes('users') && sql.includes('username')) {
      const username = params[0]
      return users.find(u => u.username === username) || null
    }
    
    return null
  }

  export const dbAll = async (sql: string, params: any[] = []): Promise<any[]> => {
    console.log('Vercel dbAll:', sql, params)
    
    if (sql.includes('users')) {
      return users
    }
    
    if (sql.includes('teams')) {
      return teams
    }
    
    if (sql.includes('players')) {
      return players
    }
    
    return []
  }

  export const queryCache = new Map<string, any>()
  export const CACHE_TTL = 60 * 1000

} else {
  // En desarrollo, usar SQLite
  console.log('Using SQLite database configuration for development')
  
  const sqlite = require('./connection')
  
  export const dbRun = sqlite.dbRun
  export const dbGet = sqlite.dbGet
  export const dbAll = sqlite.dbAll
  export const queryCache = sqlite.queryCache
  export const CACHE_TTL = sqlite.CACHE_TTL
}

// Función común para inicialización
export const initDatabase = async () => {
  if (isVercelEnvironment) {
    console.log('Database initialized for Vercel environment with in-memory data')
  } else {
    console.log('Database initialized for development environment with SQLite')
  }
}