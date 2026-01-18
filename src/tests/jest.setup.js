import { query } from "../db/pool.js";

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
    `INSERT INTO users (id)
     VALUES (1)
     ON CONFLICT (id) DO NOTHING`,
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
  const { default: pkg } = await import("pg");
  // If your pool.js exports pool/end, use that instead.
  // This is a safe fallback if you do not export pool directly.
  // If Jest hangs, you should export pool.end() from pool.js and call it here.
});
