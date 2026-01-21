const request = require('supertest')
const app = require('../index')
const pool = require('../db/pool')

describe('Booking Controller', () => {
  let testUserId
  let testSpaceId
  let testEventId
  let testBookingId

  beforeAll(async () => {
    // Creation of test user
    const userResult = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
      ['Test User', 'test@email.com', 'hashedpassword', 'user', 'en']
    )
    testUserId = userResult.rows[0].id

    // Creation of test space
    const spaceResult = await pool.query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id`,
      [testUserId, 'Test Space', 'A test space', '1 Test Rd', 'City', 'Country', 5]
    )
    testSpaceId = spaceResult.rows[0].id

    // Creation of test event
    const eventResult = await pool.query(
      `INSERT INTO events (host_user_id, space_id, title, description, category, duration_minutes, start_at,
            end_at, capacity, price_per_spot, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING id`,
      [
        testUserId,
        testSpaceId,
        'Test Event',
        'A test event',
        'Movement',
        90,
        '2026-03-02 08:00:00',
        '2026-03-02 09:30:00',
        20,
        10.0,
        'active',
      ]
    )
    testEventId = eventResult.rows[0].id
  })

  afterAll(async () => {
    // Removal of test data after testing run
    await pool.query('DELETE FROM bookings WHERE user_id = $1', [testUserId])
    await pool.query('DELETE FROM events WHERE host_user_id = $1', [testUserId])
    await pool.query('DELETE FROM spaces WHERE host_user_id = $1', [testUserId])
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId])
    await pool.end()
  })

  // Test One: Creation of an event booking
  it('Should create new event booking', async () => {
    const response = await request(app).post('/bookings').send({
      eventId: testEventId,
      userId: testUserId,
      quantity: 3,
      totalPrice: 30.0,
      paymentStatus: 'pending',
    })
    expect(response.status).toBe(201)
    expect(response.body).toHavProperty('id')
    expect(response.body.event_id).toBe(testEventId)
    testBookingId = response.body.id
  })
})
