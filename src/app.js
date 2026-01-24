const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/auth.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const spacesRoutes = require('./routes/spaces.routes');
const eventsRoutes = require('./routes/events.routes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.json({ ok: true }));

// API Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Jurrasic Park..I mean, Your Place',
    endpoints: {
      health: '/health',
      auth: '/auth',
      bookings: '/bookings',
      spaces: '/spaces',
      events: '/events'
    }
  })
});

// Other API routes
app.use('/auth', authRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/spaces', spacesRoutes);
app.use('/events', eventsRoutes);

// 404
app.all(/.*/, (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'No route with that path found' },
    attemptedPath: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;