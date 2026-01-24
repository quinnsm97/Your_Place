const fs = require('fs')
const path = require('path')
const { query, pool } = require('../db/pool')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

/**
 * Jest DB bootstrap
 *
 * Goal: tests should be runnable on any machine as long as DATABASE_URL_TEST points to an
 * existing Postgres database. We automatically reset + apply migrations, then seed users.
 */

const MIGRATIONS_DIR = path.join(__dirname, '../../db/migrations')
const RESET_SQL = path.join(__dirname, '../../db/reset.sql')

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const st of statements) {
    await query(`${st};`)
  }
}

async function resetAndMigrate() {
  await runSqlFile(RESET_SQL)

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await runSqlFile(path.join(MIGRATIONS_DIR, file))
  }
}

async function ensureHostUsers() {
  await query(
    `INSERT INTO users (id, full_name, email, password_hash, role, locale)
     VALUES
       (1, 'Test Host 1', 'host1@test.com', 'dummy_hash', 'host', 'en'),
       (2, 'Test Host 2', 'host2@test.com', 'dummy_hash', 'host', 'en')
     ON CONFLICT (id) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           locale = EXCLUDED.locale`,
    []
  )

  await query(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))`,
    []
  )
}

beforeAll(async () => {
  await resetAndMigrate()
  await ensureHostUsers()
})

beforeEach(async () => {
  await query('DELETE FROM bookings', [])
  await query('DELETE FROM events', [])
  await query('DELETE FROM spaces', [])
  await ensureHostUsers()
})

afterAll(async () => {
  if (pool && pool.end) {
    await pool.end()
  }
})
