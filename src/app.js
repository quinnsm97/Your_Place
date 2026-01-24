const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const bookingsRoutes = require('./routes/bookings.routes')
const spacesRoutes = require('./routes/spaces.routes')
const eventsRoutes = require('./routes/events.routes')

const ApiError = require('./utils/ApiError')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/auth', authRoutes)
app.use('/bookings', bookingsRoutes)
app.use('/spaces', spacesRoutes)
app.use('/events', eventsRoutes)

app.use((req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', 'Route not found'))
})

app.use(errorHandler)

module.exports = app
