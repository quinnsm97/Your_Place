const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')

async function seedSpace({ hostUserId = 1, name = 'Test Space', city = 'Sydney' } = {}) {
  const { rows } = await query(
    `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [hostUserId, name, '', '1 Test St', city, 'Australia', 10]
  )
  return rows[0]
}

async function seedEvent({
  hostUserId = 1,
  spaceId,
  title = 'Test Event',
  category = 'music',
  status = 'draft',
  startAt = '2030-01-01T10:00:00.000Z',
  endAt = '2030-01-01T12:00:00.000Z',
} = {}) {
  const { rows } = await query(
    `INSERT INTO events (
      host_user_id, space_id, title, description, category,
      start_at, end_at, capacity, price_per_spot, status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [hostUserId, spaceId, title, '', category, startAt, endAt, 10, 0, status]
  )
  return rows[0]
}

describe('Events API', () => {
  test('Create (201)', async () => {
    const mySpace = await seedSpace({ hostUserId: 1 })

    const res = await request(app).post('/events').send({
      space_id: mySpace.id,
      title: 'My Event',
      description: 'Nice',
      category: 'music',
      start_at: '2030-01-01T10:00:00.000Z',
      end_at: '2030-01-01T11:00:00.000Z',
      capacity: 10,
      price_per_spot: 0,
      status: 'draft',
    })

    expect(res.status).toBe(201)
    expect(res.body.data.space_id).toBe(mySpace.id)
    expect(res.body.data.host_user_id).toBe(1)
  })

  test('Read list (200) with filters', async () => {
    const sydneySpace = await seedSpace({ hostUserId: 1, city: 'Sydney' })
    const melbSpace = await seedSpace({ hostUserId: 1, city: 'Melbourne' })

    await seedEvent({ hostUserId: 1, spaceId: sydneySpace.id, category: 'music', status: 'draft' })
    await seedEvent({ hostUserId: 1, spaceId: melbSpace.id, category: 'tech', status: 'published' })

    const res = await request(app).get('/events?city=Melbourne&category=tech&status=published')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].city).toMatch(/Melbourne/i)
  })

  test('Read by id (200 / 404)', async () => {
    const sp = await seedSpace({ hostUserId: 1 })
    const ev = await seedEvent({ hostUserId: 1, spaceId: sp.id })

    const ok = await request(app).get(`/events/${ev.id}`)
    expect(ok.status).toBe(200)
    expect(ok.body.data.id).toBe(ev.id)

    const missing = await request(app).get('/events/999999')
    expect(missing.status).toBe(404)
  })

  test('Update (200 / 403)', async () => {
    const mySpace = await seedSpace({ hostUserId: 1 })
    const otherSpace = await seedSpace({ hostUserId: 2 })

    const ownedEvent = await seedEvent({ hostUserId: 1, spaceId: mySpace.id, title: 'Owned' })
    const otherEvent = await seedEvent({ hostUserId: 2, spaceId: otherSpace.id, title: 'Other' })

    // owned: ok
    const ok = await request(app).patch(`/events/${ownedEvent.id}`).send({ title: 'Updated' })

    expect(ok.status).toBe(200)
    expect(ok.body.data.title).toBe('Updated')

    // not owned: 403
    const forbidden = await request(app).patch(`/events/${otherEvent.id}`).send({ title: 'Hack' })

    expect(forbidden.status).toBe(403)
  })

  test('Delete (204 / 403)', async () => {
    const mySpace = await seedSpace({ hostUserId: 1 })
    const otherSpace = await seedSpace({ hostUserId: 2 })

    const ownedEvent = await seedEvent({ hostUserId: 1, spaceId: mySpace.id })
    const otherEvent = await seedEvent({ hostUserId: 2, spaceId: otherSpace.id })

    // not owned: 403
    const forbidden = await request(app).delete(`/events/${otherEvent.id}`)
    expect(forbidden.status).toBe(403)

    // owned: 204
    const ok = await request(app).delete(`/events/${ownedEvent.id}`)
    expect(ok.status).toBe(204)

    const after = await request(app).get(`/events/${ownedEvent.id}`)
    expect(after.status).toBe(404)
  })
})
