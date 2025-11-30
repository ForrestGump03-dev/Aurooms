const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  try {
    const seedData = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8')
    await pool.query(seedData)
    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()