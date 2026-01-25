const { query } = require('../db/pool')

/**
 * Find a user by email
 * @param {string} email
 * @returns {Object|null}
 */
async function findUserByEmail(email) {
  const { rows } = await query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  )

  return rows[0] || null
}

/**
 * Find a user by id
 * @param {number} id
 * @returns {Object|null}
 */
async function findUserById(id) {
  const { rows } = await query('SELECT id, full_name, email, role, locale FROM users WHERE id = $1', [id])

  return rows[0] || null
}

/**
 * Create a new user
 * @param {Object} user
 * @param {string} user.email
 * @param {string} user.passwordHash
 * @param {string} user.role
 * @returns {Object}
 */

async function createUser({ email, passwordHash, role, fullName = null }) {
  const { rows } = await query(
    `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, role
    `,
    [fullName, email, passwordHash, role]
  )
  return rows[0]
}

/**
 * Update allowed profile fields for a user.
 * Only supports updating: full_name, locale.
 * Returns the updated user row or null if no fields were provided.
 */
async function updateUserById(id, { fullName, locale }) {
  const sets = []
  const values = []
  let i = 1

  // Only add fields that were actually provided
  if (fullName !== undefined) {
    sets.push(`full_name = $${i++}`)
    values.push(fullName)
  }

  if (locale !== undefined) {
    sets.push(`locale = $${i++}`)
    values.push(locale)
  }

  // Nothing to update
  if (sets.length === 0) return null

  values.push(id)

  const { rows } = await query(
    `UPDATE users
     SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, full_name, email, role, locale`,
    values
  )

  return rows[0] || null
}

/**
 * Delete a user by id.
 * Returns { id } if deleted, otherwise null.
 */
async function deleteUserById(id) {
  const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id])
  return rows[0] || null
}

/**
 * Update a user's role (admin-only route uses this).
 * @param {number} id
 * @param {string} role
 * @returns {Object|null} Updated user row or null if not found.
 */
async function updateUserRoleById(id, role) {
  const { rows } = await query(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, full_name, email, role, locale`,
    [role, id]
  )
  return rows[0] || null
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  deleteUserById,
  updateUserRoleById,
}
