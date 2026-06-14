const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(__dirname, '..', envFile)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false })
  }
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('Migration failed: DATABASE_URL is not configured in .env.local or .env')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8')
    await pool.query(schema)
    console.log('Database schema created successfully')

    const migrationsDir = path.join(__dirname, '../database/migrations')
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()

      for (const migration of migrations) {
        const sql = fs.readFileSync(path.join(migrationsDir, migration), 'utf8')
        await pool.query(sql)
        console.log(`Migration applied: ${migration}`)
      }
    }
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
