const app = require('./app')
const { query } = require('./db/pool')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await query('SELECT 1')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to PostgreSQL:', err.message)
    process.exit(1)
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on PORT: ${PORT}`)
  })
}

start()
