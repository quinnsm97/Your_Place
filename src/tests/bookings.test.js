const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')

describe('Bookings API', () => {
  let testUserId
  let testSpaceId
  let testEventId

  beforeEach(async () => {
    // NOTE: jest.setup.js runs beforeEach too and wipes bookings/events/spaces.
    // So we seed fresh data here (after that wipe) so FK constraints pass.

    const email = `booking+${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`

    const userRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Booking Test User', email, 'dummy_hash', 'user', 'en']
    )
    testUserId = userRes.rows[0].id

    const spaceRes = await query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [testUserId, 'Test Space', 'A test space', '1 Test Rd', 'City', 'Country', 5]
    )
    testSpaceId = spaceRes.rows[0].id

    const eventRes = await query(
      `INSERT INTO events (
         host_user_id, space_id, title, description, category,
         start_at, end_at, capacity, price_per_spot, status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        testUserId,
        testSpaceId,
        'Test Event',
        'A test event',
        'Movement',
        '2030-03-02T08:00:00.000Z',
        '2030-03-02T09:30:00.000Z',
        20,
        10.0,
        'active',
      ]
    )
    testEventId = eventRes.rows[0].id
  })

  afterEach(async () => {
    // jest.setup.js cleans bookings/events/spaces; we just clean our extra user.
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  it('POST /bookings creates a new event booking (201)', async () => {
    const res = await request(app).post('/bookings').send({
      eventId: testEventId,
      userId: testUserId,
      quantity: 1,
      totalPrice: 50,
      paymentStatus: 'pending',
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.event_id).toBe(testEventId)
    expect(res.body.user_id).toBe(testUserId)
  })
})