const { query } = require('../db/pool')

async function listSpaces() {
  const { rows } = await query(
    `SELECT id, host_user_id, name, description, address, city, country, capacity, created_at, updated_at
     FROM spaces
     ORDER BY id DESC`,
    []
  )
  return rows
}

async function getSpaceById(spaceId) {
  const { rows } = await query(
    `SELECT id, host_user_id, name, description, address, city, country, capacity, created_at, updated_at
     FROM spaces
     WHERE id = $1`,
    [spaceId]
  )
  return rows[0] || null
}

async function createSpace(hostUserId, payload) {
  const { name, description, address, city, country, capacity } = payload
  const { rows } = await query(
    `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, host_user_id, name, description, address, city, country, capacity, created_at, updated_at`,
    [hostUserId, name, description ?? '', address, city, country, capacity]
  )
  return rows[0]
}

async function updateSpace(spaceId, payload) {
  const fields = []
  const values = []
  let i = 1

  for (const [key, val] of Object.entries(payload)) {
    fields.push(`${key} = $${i++}`)
    values.push(val)
  }

  values.push(spaceId)

  const { rows } = await query(
    `UPDATE spaces
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, host_user_id, name, description, address, city, country, capacity, created_at, updated_at`,
    values
  )

  return rows[0]
}

async function deleteSpace(spaceId) {
  await query(`DELETE FROM spaces WHERE id = $1`, [spaceId])
}

module.exports = { listSpaces, getSpaceById, createSpace, updateSpace, deleteSpace }
