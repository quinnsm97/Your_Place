const request = require('supertest')
const app = require('../app')
const pool = require('../db/pool')

describe('Booking Controller', () => {
  let testHostUserId
  let testUserId  
  let testSpaceId
  let testEventId
  let testBookingId

  beforeAll(async () => {

    // Creation of test host for spaces/events
    const hostResult = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
      ['Test Host', 'testhost@email.com', 'hashedpassword', 'host', 'en']
    )
    testHostUserId = hostResult.rows[0].id

    // Creation of test user for bookings
    const userResult = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
      ['Test User', 'test@email.com', 'hashedpassword', 'user', 'en']
    )
    testUserId = userResult.rows[0].id

    // Creation of test space owned by a host
    const spaceResult = await pool.query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id`,
      [testHostUserId, 'Test Space', 'A test space', '1 Test Rd', 'City', 'Country', 5]
    )
    testSpaceId = spaceResult.rows[0].id

    // Creation of test event owned by a host
    const eventResult = await pool.query(
      `INSERT INTO events (host_user_id, space_id, title, description, category, duration_minutes, start_at,
            end_at, capacity, price_per_spot, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING id`,
      [
        testHostUserId,
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
    await pool.query('DELETE FROM events WHERE host_user_id = $1', [testHostUserId])
    await pool.query('DELETE FROM spaces WHERE host_user_id = $1', [testHostUserId])
    await pool.query('DELETE FROM users WHERE id = $1', [testHostUserId, testUserId])
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
    expect(response.body).toHaveProperty('id')
    expect(response.body.event_id).toBe(testEventId)
    testBookingId = response.body.id
  })

  // Test Two: Get all bookings
  it('should get all bookings', async () => {
    const response = await request(app).get('/bookings')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  // Test Three: Get booking by ID
  it('should get booking by ID', async () => {
    const response = await request(app).get(`/bookings/${testBookingId}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(testBookingId)
  })

  // Test Four: Get booking by User ID
  it('should get all bookings for a user', async () => {
    const response = await request(app).get(`/bookings/user/${testUserId}`)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBeGreaterThan(0)
  })

  // Test Five: Update Booking
  it('should update a booking', async () => {
    const response = await request(app).put(`/bookings/${testBookingId}`).send({
      quantity: 4,
      totalPrice: 40.0,
      paymentStatus: 'paid',
    })

    expect(response.status).toBe(200)
    expect(response.body.quantity).toBe(4)
    expect(response.body.payment_status).toBe('paid')
  })

  // Test Six: Delete a booking
  it('should delete a booking', async () => {
    const response = await request(app).delete(`/bookings/${testBookingId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message')
  })
})
