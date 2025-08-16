import { NextRequest, NextResponse } from "next/server"
import { teamRepository } from "@/lib/database/teams"
import { playerRepository } from "@/lib/database/players"

export async function DELETE(request: NextRequest) {
  try {
    console.log("🧹 Iniciando limpieza de datos...")

    // Primero obtener estadísticas antes de eliminar
    const allTeams = await teamRepository.getAll()
    const allPlayers = await playerRepository.getAll()
    
    console.log(`📊 Datos encontrados:`)
    console.log(`   - ${allTeams.length} equipos`)
    console.log(`   - ${allPlayers.length} jugadores`)

    let deletedPlayers = 0
    let deletedTeams = 0

    // Eliminar todos los jugadores primero (por las relaciones de FK)
    console.log("🗑️  Eliminando jugadores...")
    for (const player of allPlayers) {
      const success = await playerRepository.delete(player.id)
      if (success) {
        deletedPlayers++
      }
    }
    console.log(`✅ ${deletedPlayers} jugadores eliminados`)

    // Eliminar todos los equipos
    console.log("🗑️  Eliminando equipos...")
    for (const team of allTeams) {
      const success = await teamRepository.delete(team.id)
      if (success) {
        deletedTeams++
      }
    }
    console.log(`✅ ${deletedTeams} equipos eliminados`)

    console.log("🎉 Limpieza completada exitosamente!")

    return NextResponse.json({
      success: true,
      message: `Datos eliminados exitosamente: ${deletedTeams} equipos y ${deletedPlayers} jugadores`,
      deletedTeams,
      deletedPlayers,
      summary: {
        teamsFound: allTeams.length,
        playersFound: allPlayers.length,
        teamsDeleted: deletedTeams,
        playersDeleted: deletedPlayers
      }
    })

  } catch (error) {
    console.error("❌ Error al limpiar datos:", error)
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
