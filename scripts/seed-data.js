#!/usr/bin/env node

// Script para inicializar datos de ejemplo en la base de datos SQLite local

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'app.db');
const dbDir = path.dirname(dbPath);

// Crear directorio data si no existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

async function initializeData() {
  console.log('🚀 Inicializando datos de ejemplo...');
  
  try {
    // Crear usuario administrador de ejemplo
    const adminPassword = await bcrypt.hash('admin123', 12);
    const coachPassword = await bcrypt.hash('coach123', 12);
    
    db.serialize(() => {
      // Insertar usuarios de ejemplo
      const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (email, name, role, password_hash) 
        VALUES (?, ?, ?, ?)
      `);
      
      insertUser.run('admin@academia.com', 'Administrador', 'admin', adminPassword);
      insertUser.run('coach@academia.com', 'Entrenador Principal', 'coach', coachPassword);
      insertUser.run('parent@email.com', 'Padre de Familia', 'parent', coachPassword);
      
      insertUser.finalize();
      
      // Insertar equipos de ejemplo
      const insertTeam = db.prepare(`
        INSERT OR IGNORE INTO teams (name, category, coach_name, description, max_players) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      insertTeam.run('Leones Sub-10', 'Sub-10', 'Carlos Rodríguez', 'Equipo de niños de 8-10 años', 15);
      insertTeam.run('Águilas Sub-12', 'Sub-12', 'María González', 'Equipo de niños de 10-12 años', 18);
      insertTeam.run('Tigres Sub-14', 'Sub-14', 'José Martínez', 'Equipo de adolescentes de 12-14 años', 20);
      insertTeam.run('Halcones Sub-16', 'Sub-16', 'Ana López', 'Equipo de adolescentes de 14-16 años', 22);
      
      insertTeam.finalize();
      
      // Insertar jugadores de ejemplo
      const insertPlayer = db.prepare(`
        INSERT OR IGNORE INTO players (
          name, birth_date, position, team_id, parent_name, parent_phone, parent_email,
          medical_notes, emergency_contact, emergency_phone, is_active, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Función para calcular fecha de nacimiento basada en edad
      const getBirthDate = (age) => {
        const today = new Date();
        const birthYear = today.getFullYear() - age;
        return `${birthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      };
      
      const today = new Date().toISOString().split('T')[0];
      
      // Jugadores para equipo Sub-10 (team_id: 1)
      insertPlayer.run('Juan Pérez', getBirthDate(9), 'Forward', 1, 'María Pérez', '555-0101', 'maria.perez@email.com', 'Ninguna', 'Pedro Pérez', '555-0102', 1, today);
      insertPlayer.run('Luis García', getBirthDate(10), 'Midfielder', 1, 'Ana García', '555-0103', 'ana.garcia@email.com', 'Alergia al polen', 'Luis García Sr.', '555-0104', 1, today);
      insertPlayer.run('Carlos Ruiz', getBirthDate(8), 'Defender', 1, 'Carmen Ruiz', '555-0105', 'carmen.ruiz@email.com', 'Ninguna', 'Roberto Ruiz', '555-0106', 1, today);
      
      // Jugadores para equipo Sub-12 (team_id: 2)
      insertPlayer.run('Diego Morales', getBirthDate(11), 'Goalkeeper', 2, 'Laura Morales', '555-0107', 'laura.morales@email.com', 'Usa lentes', 'Fernando Morales', '555-0108', 1, today);
      insertPlayer.run('Andrés Silva', getBirthDate(12), 'Forward', 2, 'Patricia Silva', '555-0109', 'patricia.silva@email.com', 'Ninguna', 'Andrés Silva Sr.', '555-0110', 1, today);
      
      // Jugadores sin equipo
      insertPlayer.run('Sofía Herrera', getBirthDate(13), 'Midfielder', null, 'Rosa Herrera', '555-0111', 'rosa.herrera@email.com', 'Ninguna', 'Miguel Herrera', '555-0112', 1, today);
      insertPlayer.run('Mateo Jiménez', getBirthDate(15), 'Defender', null, 'Elena Jiménez', '555-0113', 'elena.jimenez@email.com', 'Asma leve', 'Raúl Jiménez', '555-0114', 1, today);
      
      insertPlayer.finalize();
    });
    
    console.log('✅ Datos de ejemplo insertados correctamente');
    console.log('\n📝 Usuarios creados:');
    console.log('👤 Admin: admin@academia.com / admin123');
    console.log('🏃 Coach: coach@academia.com / coach123');
    console.log('👨‍👩‍👧‍👦 Parent: parent@email.com / coach123');
    console.log('\n🏆 Se crearon 4 equipos y 7 jugadores de ejemplo');
    
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
  } finally {
    db.close();
  }
}

initializeData();
