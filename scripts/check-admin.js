const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/app.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando usuarios...');

// Primero mostrar todos los usuarios
db.all("SELECT id, name, email, role FROM users", (err, rows) => {
  if (err) {
    console.error('❌ Error al consultar usuarios:', err);
    return;
  }
  
  console.log('\n👥 Usuarios en la base de datos:');
  console.table(rows);
  
  if (rows.length > 0) {
    // Actualizar el primer usuario a admin si no lo es
    const firstUser = rows[0];
    if (firstUser.role !== 'admin') {
      console.log(`\n🔧 Actualizando ${firstUser.name} a administrador...`);
      
      db.run("UPDATE users SET role = 'admin' WHERE id = ?", [firstUser.id], function(err) {
        if (err) {
          console.error('❌ Error al actualizar usuario:', err);
        } else {
          console.log('✅ Usuario actualizado exitosamente');
          console.log(`👤 ${firstUser.name} ahora es administrador`);
        }
        db.close();
      });
    } else {
      console.log(`\n✅ ${firstUser.name} ya es administrador`);
      db.close();
    }
  } else {
    console.log('\n⚠️  No hay usuarios en la base de datos');
    db.close();
  }
});
