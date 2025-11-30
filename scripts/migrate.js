const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function migrate() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
	})

	try {
		const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8')
		await pool.query(schema)
		console.log('✅ Database schema created successfully')
	} catch (error) {
		console.error('❌ Migration failed:', error)
		process.exit(1)
	} finally {
		await pool.end()
	}
}

migrate()
