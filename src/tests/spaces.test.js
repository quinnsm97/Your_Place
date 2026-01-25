const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')
const { createToken } = require('../services/auth.service')

const AUTH_USER = { id: 1, role: 'host' }

const authHeader = () => ({
  Authorization: `Bearer ${createToken(AUTH_USER)}`,
})

async function seedSpace({ hostUserId = 1, name = 'Test Space' } = {}) {
  const { rows } = await query(
    `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [hostUserId, name, '', '1 Test St', 'Sydney', 'Australia', 10]
  )
  return rows[0]
}

describe('Spaces API', () => {
  test('Create (201)', async () => {
    const res = await request(app).post('/spaces').set(authHeader()).send({
      name: 'My Space',
      description: 'Nice',
      address: '1 Main St',
      city: 'Sydney',
      country: 'Australia',
      capacity: 20,
    })

    expect(res.status).toBe(201)
    expect(res.body?.data?.id).toBeTruthy()
    expect(res.body.data.name).toBe('My Space')
    expect(res.body.data.host_user_id).toBe(1)
  })

  test('Read list (200)', async () => {
    await seedSpace({ name: 'Space A' })
    await seedSpace({ name: 'Space B' })

    const res = await request(app).get('/spaces')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(2)
  })

  test('Read by id (200 / 404)', async () => {
    const space = await seedSpace({ name: 'Space A' })

    const ok = await request(app).get(`/spaces/${space.id}`)
    expect(ok.status).toBe(200)
    expect(ok.body.data.id).toBe(space.id)

    const missing = await request(app).get('/spaces/999999')
    expect(missing.status).toBe(404)
    expect(missing.body?.error?.code).toBeTruthy()
  })

  test('Update (200 / 403)', async () => {
    const owned = await seedSpace({ hostUserId: 1, name: 'Owned' })
    const other = await seedSpace({ hostUserId: 2, name: 'Not Mine' })

    const ok = await request(app)
      .patch(`/spaces/${owned.id}`)
      .set(authHeader())
      .send({ name: 'Updated Name' })

    expect(ok.status).toBe(200)
    expect(ok.body.data.name).toBe('Updated Name')

    const forbidden = await request(app)
      .patch(`/spaces/${other.id}`)
      .set(authHeader())
      .send({ name: 'Hack' })

    expect(forbidden.status).toBe(403)
    expect(forbidden.body?.error?.code).toBeTruthy()
  })

  test('Delete (204 / 403)', async () => {
    const owned = await seedSpace({ hostUserId: 1, name: 'Owned' })
    const other = await seedSpace({ hostUserId: 2, name: 'Not Mine' })

    const forbidden = await request(app).delete(`/spaces/${other.id}`).set(authHeader())
    expect(forbidden.status).toBe(403)

    const ok = await request(app).delete(`/spaces/${owned.id}`).set(authHeader())
    expect(ok.status).toBe(204)

    const after = await request(app).get(`/spaces/${owned.id}`)
    expect(after.status).toBe(404)
  })

  test('POST /spaces returns 401 when missing auth', async () => {
    const res = await request(app).post('/spaces').send({
      name: 'No Auth Space',
      description: 'Test',
      address: '1 Main St',
      city: 'Sydney',
      country: 'Australia',
      capacity: 10,
    })
    expect(res.status).toBe(401)
    expect(res.body?.error?.code).toBe('UNAUTHORIZED')
  })
})
