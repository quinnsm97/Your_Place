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
  const { rows } = await query('SELECT id, email, role FROM users WHERE id = $1', [id])

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
async function createUser({ email, passwordHash, role }) {
  const { rows } = await query(
    `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role
    `,
    [email, passwordHash, role]
  )

  return rows[0]
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
}
