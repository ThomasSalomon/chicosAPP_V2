import { NextRequest, NextResponse } from "next/server"
import { teamRepository } from "@/lib/database/teams"
import { playerRepository } from "@/lib/database/players"

// Datos de equipos ficticios
const teamNames = [
  "Leones FC", "Águilas United", "Tiburones CF", "Dragones FC", "Lobos Academy",
  "Halcones FC", "Panteras United", "Cóndores CF", "Jaguares FC", "Pumas Academy"
]

const categories = ["Sub-8", "Sub-10", "Sub-12", "Sub-14", "Sub-16"]

const coachNames = [
  "Carlos Mendoza", "Ana Rodriguez", "Miguel Torres", "Sofia García", "Diego López",
  "María Fernández", "Luis Herrera", "Carmen Ruiz", "Roberto Silva", "Elena Morales"
]

// Nombres ficticios para niños
const boyNames = [
  "Alejandro", "Santiago", "Sebastián", "Mateo", "Diego", "Nicolás", "Samuel", "Benjamín",
  "Lucas", "Ángel", "Adrián", "Gabriel", "Carlos", "Emilio", "Fernando", "Joaquín",
  "Leonardo", "Manuel", "Pablo", "Ricardo", "Andrés", "Eduardo", "Francisco", "Javier",
  "Jorge", "José", "Martín", "Pedro", "Rafael", "Tomás"
]

const girlNames = [
  "Sofía", "Isabella", "Camila", "Valentina", "Ximena", "Natalia", "Mariana", "Gabriela",
  "Sara", "Andrea", "Elena", "Carolina", "Alejandra", "Daniela", "María", "Paula",
  "Fernanda", "Lucía", "Melissa", "Nicole", "Paola", "Regina", "Valeria", "Victoria",
  "Adriana", "Beatriz", "Cristina", "Diana", "Esperanza", "Gloria"
]

const lastNames = [
  "García", "Rodríguez", "López", "Hernández", "González", "Pérez", "Sánchez", "Ramírez",
  "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez",
  "Ortiz", "Chávez", "Ruiz", "Jiménez", "Herrera", "Medina", "Castro", "Vargas",
  "Romero", "Aguilar", "Mendoza", "Silva", "Vásquez"
]

const positions = ["Portero", "Defensa", "Mediocampo", "Delantero"]

// Función para obtener nombre aleatorio
function getRandomName() {
  const isGirl = Math.random() > 0.5
  const firstName = isGirl 
    ? girlNames[Math.floor(Math.random() * girlNames.length)]
    : boyNames[Math.floor(Math.random() * boyNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const secondLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return `${firstName} ${lastName} ${secondLastName}`
}

// Función para generar teléfono
function generatePhone() {
  return `+57 3${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
}

// Función para generar email
function generateEmail(name: string) {
  const cleanName = name.toLowerCase()
    .replace(/\s+/g, '.')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${cleanName}@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando inyección de datos...")

    let totalPlayers = 0
    const createdTeams = []

    // Crear cada equipo con sus jugadores inmediatamente
    for (let i = 0; i < 10; i++) {
      console.log(`\n🏆 Creando equipo ${i + 1}/10: ${teamNames[i]}`)
      
      // Crear el equipo
      const team = await teamRepository.create({
        name: teamNames[i],
        category: categories[Math.floor(Math.random() * categories.length)],
        coach_name: coachNames[i],
        description: `Equipo de fútbol ${teamNames[i]} - Entrenando futuros campeones`,
        max_players: 25
      })
      
      console.log(`✅ Equipo creado: ${team.name} (ID: ${team.id})`)
      console.log(`👥 Creando 20 jugadores para ${team.name}...`)
      
      // Crear 20 jugadores para este equipo específico
      const teamPlayers = []
      for (let j = 0; j < 20; j++) {
        const playerName = getRandomName()
        const parentName = getRandomName()
        const emergencyContact = getRandomName()
        
        // Generar fecha de nacimiento aleatoria para edades entre 6 y 13 años
        const age = Math.floor(Math.random() * 8) + 6
        const today = new Date()
        const birthYear = today.getFullYear() - age
        const birthMonth = Math.floor(Math.random() * 12)
        const birthDay = Math.floor(Math.random() * 28) + 1 // 1-28 para evitar problemas con febrero
        const birthDate = new Date(birthYear, birthMonth, birthDay).toISOString().split('T')[0]
        
        const player = await playerRepository.create({
          name: playerName,
          birth_date: birthDate,
          position: positions[Math.floor(Math.random() * positions.length)],
          team_id: team.id, // Asignar directamente al equipo recién creado
          parent_name: parentName,
          parent_phone: generatePhone(),
          parent_email: generateEmail(parentName),
          medical_notes: Math.random() > 0.7 ? "Alergia al polen" : undefined,
          emergency_contact: emergencyContact,
          emergency_phone: generatePhone(),
          is_active: true, // Todos los jugadores empiezan activos
          registration_date: new Date().toISOString().split('T')[0]
        })
        
        teamPlayers.push(player)
        totalPlayers++
      }
      
      console.log(`✅ ${teamPlayers.length} jugadores creados para ${team.name}`)
      console.log(`📊 Progreso: ${i + 1}/10 equipos completados`)
      
      // Agregar información del equipo con sus jugadores
      createdTeams.push({
        ...team,
        players: teamPlayers
      })
    }

    console.log(`\n🎉 Inyección completada exitosamente!`)
    console.log(`📈 Resumen: ${createdTeams.length} equipos creados con ${totalPlayers} jugadores total`)

    return NextResponse.json({
      success: true,
      message: `Datos inyectados exitosamente: ${createdTeams.length} equipos con ${totalPlayers} jugadores`,
      teams: createdTeams.length,
      players: totalPlayers,
      details: createdTeams.map(team => ({
        teamName: team.name,
        teamId: team.id,
        playersCount: team.players?.length || 0,
        coach: team.coach_name,
        category: team.category
      }))
    })

  } catch (error) {
    console.error("Error al inyectar datos:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}
