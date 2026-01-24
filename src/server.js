require('dotenv').config()
const app = require('./app')
const { query } = require('./db/pool')

const PORT = process.env.PORT || 5000

async function start() {
  // Quick DB connectivity check (fails fast if DATABASE_URL is missing/invalid)
  try {
    await query('SELECT 1')
    console.log('Connected to PostgreSQL')
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
  })
}

start()
