const fs = require('fs')
const path = require('path')
const { query, pool } = require('../db/pool')

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
  // node-postgres can run multiple statements when no params are provided
  await query(sql)
}

async function resetAndMigrate() {
  await runSqlFile(RESET_SQL)

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  // Apply in order: 000..., 001..., etc
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    await runSqlFile(path.join(MIGRATIONS_DIR, file))
  }
}

async function ensureHostUsers() {
  // id=1 and id=2 as "hosts" for ownership tests
  await query(
    `INSERT INTO users (id, full_name, email, password_hash, role, locale)
     VALUES
       (1, 'Test Host 1', 'host1@test.com', 'dummy_hash', 'host', 'en'),
       (2, 'Test Host 2', 'host2@test.com', 'dummy_hash', 'host', 'en')
     ON CONFLICT (id) DO UPDATE
       SET full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           role = EXCLUDED.role`,
    []
  )
  // Ensure the SERIAL sequence is ahead of our fixed ids (1,2)
  await query(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))`,
    []
  )
}

async function ensureUser2() {
  // Create user 2 for tests that need a different user
  await query(
    `INSERT INTO users (id, email, password_hash, role)
     VALUES (2, 'test2@example.com', 'dummy_hash', 'host')
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role`,
    []
  );
}
beforeAll(async () => {
  await resetAndMigrate()
  await ensureHostUsers()
})

beforeEach(async () => {
  // Clean tables between tests. Order matters because of foreign keys.
  await query('DELETE FROM bookings', [])
  await query('DELETE FROM events', [])
  await query('DELETE FROM spaces', [])

  // Keep users, but re-ensure roles/emails
  await ensureHostUsers()
})

afterAll(async () => {
  // Only do this if you are NOT also ending the pool elsewhere (e.g., globalTeardown)
  if (pool && pool.end) {
    await pool.end()
  }
})