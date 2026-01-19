// Sets up the Express app
const express = require('express')

const helmet = require('helmet')
const cors = require('cors')

const app = express()

// Registers global middleware (cors, helmet, json parsing)
const corsOptions = {
  origin: ['http://localhost:5000', 'https://deployedFrontend.com'],
  optionsSuccessStatus: 200,
}

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())

// Health check / base route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Your Place!',
  })
})

// If a route/path is requested that doesn't exist
app.all(/.*/, (req, res) => {
  res.status(404).json({
    message: 'No route with that path found!',
    attemptedPath: req.path,
  })
})

// Exports the configured app for server.js and tests
module.exports = app
