const { query } = require("../db/pool");

async function listEvents(filters = {}) {
  const where = [];
  const values = [];
  let i = 1;

  if (filters.city) {
    where.push(`s.city ILIKE $${i++}`);
    values.push(`%${filters.city}%`);
  }
  if (filters.category) {
    where.push(`e.category ILIKE $${i++}`);
    values.push(`%${filters.category}%`);
  }
  if (filters.status) {
    where.push(`e.status = $${i++}`);
    values.push(filters.status);
  }

  const sql = `
    SELECT
      e.id, e.host_user_id, e.space_id,
      e.title, e.description, e.category,
      e.start_at, e.end_at, e.capacity, e.price_per_spot, e.status,
      e.created_at, e.updated_at,
      s.name AS space_name, s.city, s.country
    FROM events e
    JOIN spaces s ON s.id = e.space_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY e.id DESC
  `;

  const { rows } = await query(sql, values);
  return rows;
}

async function getEventById(eventId) {
  const { rows } = await query(
    `SELECT id, host_user_id, space_id, title, description, category,
            start_at, end_at, capacity, price_per_spot, status, created_at, updated_at
     FROM events
     WHERE id = $1`,
    [eventId]
  );
  return rows[0] || null;
}

async function createEvent(hostUserId, payload) {
  const {
    space_id, title, description, category,
    start_at, end_at, capacity, price_per_spot, status,
  } = payload;

  const { rows } = await query(
    `INSERT INTO events (
       host_user_id, space_id, title, description, category,
       start_at, end_at, capacity, price_per_spot, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, host_user_id, space_id, title, description, category,
               start_at, end_at, capacity, price_per_spot, status, created_at, updated_at`,
    [
      hostUserId, space_id, title, description ?? "", category,
      start_at, end_at, capacity, price_per_spot, status ?? "draft",
    ]
  );

  return rows[0];
}

async function updateEvent(eventId, payload) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, val] of Object.entries(payload)) {
    fields.push(`${key} = $${i++}`);
    values.push(val);
  }

  values.push(eventId);

  const { rows } = await query(
    `UPDATE events
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, host_user_id, space_id, title, description, category,
               start_at, end_at, capacity, price_per_spot, status, created_at, updated_at`,
    values
  );

  return rows[0];
}

async function deleteEvent(eventId) {
  await query(`DELETE FROM events WHERE id = $1`, [eventId]);
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
