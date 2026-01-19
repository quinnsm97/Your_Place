// Defines HTTP routes for authentication

// e.g. POST /auth/register, POST /auth/login

// Maps routes to controller functions

const express = require('express')
const { register, login } = require('../controllers/auth.controller')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

module.exports = router
