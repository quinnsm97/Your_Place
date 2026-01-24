const { Pool } = require('pg')

require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })

const isTest = process.env.NODE_ENV === 'test'

const connectionString = isTest ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    `Missing database connection string for ${isTest ? 'test' : 'development'} environment`
  )
}

const pool = new Pool({
  connectionString,
})

pool.on('connect', () => {
  if (!isTest) {
    console.log('Connected to PostgreSQL')
  }
})

pool.on('error', (err) => {
  console.error('Unexpected PG error', err)
  process.exit(1)
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}
