const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')
const { createToken } = require('../services/auth.service')

describe('Bookings API', () => {
  const authHeader = (user) => ({
    Authorization: `Bearer ${createToken(user)}`,
  })

  let hostUserId
  let tokenUser
  let spaceId
  let eventId
  let bookingId

  beforeEach(async () => {
    hostUserId = 1
    tokenUser = { id: hostUserId, role: 'host' }

    const spaceRes = await query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [hostUserId, 'Test Space', 'A test space', '1 Test Rd', 'City', 'Country', 5]
    )
    spaceId = spaceRes.rows[0].id

    const eventRes = await query(
      `INSERT INTO events (
         host_user_id, space_id, title, description, category,
         start_at, end_at, capacity, price_per_spot, status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        hostUserId,
        spaceId,
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
    eventId = eventRes.rows[0].id

    const bookingRes = await request(app)
      .post('/bookings')
      .set(authHeader(tokenUser))
      .send({ eventId, quantity: 1, totalPrice: 50, paymentStatus: 'pending' })

    bookingId = bookingRes.body && bookingRes.body.data && bookingRes.body.data.id
  })

  it('POST /bookings creates a booking (201)', async () => {
    const res = await request(app)
      .post('/bookings')
      .set(authHeader(tokenUser))
      .send({ eventId, quantity: 2, totalPrice: 100, paymentStatus: 'pending' })

    expect(res.status).toBe(201)
    expect(res.body && res.body.data).toHaveProperty('id')
    expect(res.body.data.event_id).toBe(eventId)
    expect(res.body.data.user_id).toBe(hostUserId)
  })

  it('GET /bookings lists current user bookings (200)', async () => {
    const res = await request(app).get('/bookings').set(authHeader(tokenUser))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /bookings/:id returns a booking (200)', async () => {
    const res = await request(app).get(`/bookings/${bookingId}`).set(authHeader(tokenUser))
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(bookingId)
  })

  it('PATCH /bookings/:id updates a booking (200)', async () => {
    const res = await request(app)
      .patch(`/bookings/${bookingId}`)
      .set(authHeader(tokenUser))
      .send({ quantity: 3, totalPrice: 150 })

    expect(res.status).toBe(200)
    expect(res.body.data.quantity).toBe(3)
  })

  it('DELETE /bookings/:id deletes a booking (204)', async () => {
    const res = await request(app).delete(`/bookings/${bookingId}`).set(authHeader(tokenUser))
    expect(res.status).toBe(204)

    const check = await request(app).get(`/bookings/${bookingId}`).set(authHeader(tokenUser))
    expect(check.status).toBe(404)
  })

  it('POST /bookings returns 401 when missing auth', async () => {
    const res = await request(app).post('/bookings').send({ eventId, quantity: 1, totalPrice: 50 })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('GET /bookings/:id returns 400 for invalid id param', async () => {
    const res = await request(app).get('/bookings/not-a-number').set(authHeader(tokenUser))
    expect(res.status).toBe(400)
    expect(res.body && res.body.error && res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('POST /bookings returns 400 when missing required fields', async () => {
    const res = await request(app).post('/bookings').set(authHeader(tokenUser)).send({ eventId })
    expect(res.status).toBe(400)
    expect(res.body && res.body.error && res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('POST /bookings returns 400 when both eventId and spaceId are provided', async () => {
    const res = await request(app)
      .post('/bookings')
      .set(authHeader(tokenUser))
      .send({ eventId, spaceId, quantity: 1, totalPrice: 50 })

    expect(res.status).toBe(400)
    expect(res.body && res.body.error && res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('GET /bookings/:id returns 403 for a different user', async () => {
    const email = `u2+${Date.now()}@test.com`
    const userRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      ['Another User', email, 'dummy_hash', 'user', 'en']
    )
    const otherUser = { id: userRes.rows[0].id, role: 'user' }

    const res = await request(app).get(`/bookings/${bookingId}`).set(authHeader(otherUser))
    expect(res.status).toBe(403)
    expect(res.body && res.body.error && res.body.error.code).toBe('FORBIDDEN')

    await query('DELETE FROM users WHERE id = $1', [otherUser.id])
  })

  it('GET /bookings/:id returns 404 when booking does not exist', async () => {
    const res = await request(app).get('/bookings/999999').set(authHeader(tokenUser))
    expect(res.status).toBe(404)
    expect(res.body && res.body.error && res.body.error.code).toBe('NOT_FOUND')
  })

  it('GET /bookings?scope=host returns bookings for hosted events/spaces (host only)', async () => {
    const hostUser = { id: 1, role: 'host' }

    const res = await request(app)
      .get('/bookings?scope=host')
      .set(authHeader(hostUser))

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /bookings?scope=host is forbidden for non-host', async () => {
    const email = `u+${Date.now()}@test.com`
    const userRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      ['Normal User', email, 'dummy_hash', 'user', 'en']
    )
    const user = { id: userRes.rows[0].id, role: 'user' }

    const res = await request(app)
      .get('/bookings?scope=host')
      .set(authHeader(user))

    expect(res.status).toBe(403)
    expect(res.body && res.body.error && res.body.error.code).toBe('FORBIDDEN')

    await query('DELETE FROM users WHERE id = $1', [user.id])
  })

  it('PATCH /bookings/:id restricts host update to paymentStatus for other users', async () => {
    const email = `u3+${Date.now()}@test.com`
    const userRes = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      ['Normal User', email, 'dummy_hash', 'user', 'en']
    )
    const normalUser = { id: userRes.rows[0].id, role: 'user' }

    const createRes = await request(app)
      .post('/bookings')
      .set(authHeader(normalUser))
      .send({ eventId, quantity: 1, totalPrice: 50 })

    const otherBookingId = createRes.body && createRes.body.data && createRes.body.data.id

    const hostUser = { id: 1, role: 'host' }
    const badUpdate = await request(app)
      .patch(`/bookings/${otherBookingId}`)
      .set(authHeader(hostUser))
      .send({ quantity: 5 })

    expect(badUpdate.status).toBe(403)
    expect(badUpdate.body && badUpdate.body.error && badUpdate.body.error.code).toBe('FORBIDDEN')

    const okUpdate = await request(app)
      .patch(`/bookings/${otherBookingId}`)
      .set(authHeader(hostUser))
      .send({ paymentStatus: 'paid' })

    expect(okUpdate.status).toBe(200)
    expect(okUpdate.body.data.payment_status).toBe('paid')

    await query('DELETE FROM users WHERE id = $1', [normalUser.id])
  })
})
