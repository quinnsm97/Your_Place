const { query } = require("../db/pool");

/**
 * These tests assume:
 * - You are running against a TEST database via DATABASE_URL
 * - Tables exist: users, spaces, events
 * - requireAuth stub sets req.user = { id: 1, role: "host" }
 *
 * The setup ensures user id 1 exists, and cleans tables between tests.
 */

async function ensureUser1() {
  // If your users table has different columns, adjust minimally.
  // The only hard requirement is that users(id=1) exists.
  await query(
    `INSERT INTO users (id, email, password_hash, role)
     VALUES (1, 'test@example.com', 'dummy_hash', 'host')
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role`,
    []
  );
}

beforeAll(async () => {
  await ensureUser1();
});

beforeEach(async () => {
  // Order matters because of foreign keys
  await query("DELETE FROM events", []);
  await query("DELETE FROM spaces", []);
  // Keep users
  await ensureUser1();
});

afterAll(async () => {
  // Close pool cleanly so Jest exits
  const { pool } = require("../db/pool");
  // If your pool.js exports pool/end, use that instead.
  // This is a safe fallback if you do not export pool directly.
  // If Jest hangs, you should export pool.end() from pool.js and call it here.
  if (pool && pool.end) {
    await pool.end();
  }
});
