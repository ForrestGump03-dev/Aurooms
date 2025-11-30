// Script per eseguire migrazioni database
// Esegui con: node scripts/run-migration.js

require('dotenv').config({ path: '.env.development' });
const { Pool } = require('pg');

async function runMigration() {
  console.log('🚀 Avvio migrazione database...\n');

  // Leggi connection string
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Errore: DATABASE_URL non trovato in .env');
    console.error('   Aggiungi la variabile d\'ambiente prima di eseguire la migrazione');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Migration 001: Add push_subscriptions table
    console.log('📝 Esecuzione: 001_add_push_subscriptions.sql');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Tabella push_subscriptions creata');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
      ON push_subscriptions(endpoint)
    `);
    console.log('   ✅ Indice endpoint creato');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created 
      ON push_subscriptions(created_at DESC)
    `);
    console.log('   ✅ Indice created_at creato');

    // Verifica
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'push_subscriptions'
    `);

    if (result.rows[0].count > 0) {
      console.log('\n✅ Migrazione completata con successo!');
      console.log('   La tabella push_subscriptions è pronta per l\'uso.\n');
    } else {
      console.log('\n⚠️  Warning: Tabella non trovata dopo la migrazione');
    }

    await pool.end();

  } catch (error) {
    console.error('\n❌ Errore durante la migrazione:');
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

// Esegui migrazione
runMigration();
