const { findUserByEmail, createUser } = require('../models/users.model')
const { hashPassword, verifyPassword, createToken } = require('../services/auth.service')

/**
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const passwordHash = await hashPassword(password)

    const user = await createUser({
      email,
      passwordHash,
      role: 'user',
      fullName
    })

    const token = createToken(user)

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Login an existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
}
