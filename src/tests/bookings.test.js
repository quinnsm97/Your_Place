const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')

describe('Booking Controller', () => {
  let testHostUserId
  let testUserId
  let testSpaceId
  let testEventId
  let testBookingId

  beforeAll(async () => {
    // Creation of test host for spaces/events
    const hostResult = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
      ['Test Host', 'testhost@email.com', 'hashedpassword', 'host', 'en']
    )
    testHostUserId = hostResult.rows[0].id

    // Creation of test user for bookings
    const userResult = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
      ['Test User', 'test@email.com', 'hashedpassword', 'user', 'en']
    )
    testUserId = userResult.rows[0].id

    // Creation of test space owned by a host
    const spaceResult = await query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id`,
      [testHostUserId, 'Test Space', 'A test space', '1 Test Rd', 'City', 'Country', 5]
    )
    testSpaceId = spaceResult.rows[0].id

    // Creation of test event owned by a host
    const eventResult = await query(
      `INSERT INTO events (host_user_id, space_id, title, description, category, start_at,
            end_at, capacity, price_per_spot, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id`,
      [
        testHostUserId,
        testSpaceId,
        'Test Event',
        'A test event',
        'Movement',
        '2026-03-02 08:00:00',
        '2026-03-02 09:30:00',
        20,
        10.0,
        'active',
      ]
    )
    testEventId = eventResult.rows[0].id
    console.log('✅ Created event with ID:', testEventId)
    
    // Verify the event exists
    const checkEvent = await query('SELECT * FROM events WHERE id = $1', [testEventId])
    console.log('✅ Event found in DB:', checkEvent.rows[0] ? 'YES' : 'NO')
    console.log('✅ Event details:', checkEvent.rows[0])
  })

  afterAll(async () => {
    // Removal of test data after testing run
    await query('DELETE FROM bookings WHERE user_id = $1', [testUserId])
    await query('DELETE FROM events WHERE host_user_id = $1', [testHostUserId])
    await query('DELETE FROM spaces WHERE host_user_id = $1', [testHostUserId])
    await query('DELETE FROM users WHERE id IN ($1, $2)', [testHostUserId, testUserId])
  })

  // Test One: Creation of an event booking
  it('Should create new event booking', async () => {
    const response = await request(app).post('/bookings').send({
      event_id: testEventId,
      user_id: testUserId,
      quantity: 3,
      total_price: 30.0,
      payment_status: 'pending',
    })

    console.log('Status:', response.status)
    console.log('Body:', JSON.stringify(response.body, null, 2))
    
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
      total_price: 40.0,
      payment_status: 'paid',
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