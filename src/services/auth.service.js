const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * Hash a plain text password
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain text password with a hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

/**
 * Create a JWT for a user
 * @param {Object} user
 * @param {number} user.id
 * @param {string} user.role
 * @returns {string}
 */
function createToken({ id, role }) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
}
