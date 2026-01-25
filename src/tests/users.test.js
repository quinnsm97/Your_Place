const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')
const { createToken } = require('../services/auth.service')

describe('Users API', () => {
  const password = 'password123'

  // Track any users we create so we can clean up.
  const createdEmails = []

  const makeEmail = (prefix = 'me') => {
    const rand = Math.random().toString(16).slice(2)
    return `${prefix}+${Date.now()}-${rand}@test.com`
  }

  afterEach(async () => {
    // Clean up users created by these tests.
    // (jest.setup.js keeps users around between tests)
    // eslint-disable-next-line no-restricted-syntax
    for (const e of createdEmails) {
      // eslint-disable-next-line no-await-in-loop
      await query('DELETE FROM users WHERE email = $1', [e])
    }
    createdEmails.length = 0
  })

  test('GET /users/me returns 401 when no token', async () => {
    const res = await request(app).get('/users/me')
    expect(res.status).toBe(401)
  })

  test('GET /users/me returns 401 when token is invalid', async () => {
    const res = await request(app).get('/users/me').set('Authorization', 'Bearer not-a-real-token')

    expect(res.status).toBe(401)
  })

  test('GET /users/me returns 200 with user data when authenticated', async () => {
    const email = makeEmail('me')
    createdEmails.push(email)

    // Register
    const reg = await request(app).post('/auth/register').send({
      email,
      password,
      fullName: 'Test User',
    })

    expect(reg.status).toBe(201)
    expect(reg.body.token).toBeTruthy()

    // Login (prove login works too)
    const login = await request(app).post('/auth/login').send({
      email,
      password,
    })

    expect(login.status).toBe(200)
    const { token } = reg.body

    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(email)
    expect(res.body.data.full_name).toBe('Test User')
  })

  test('PATCH /users/me updates profile fields (200)', async () => {
    const email = makeEmail('me')
    createdEmails.push(email)

    // Register
    const reg = await request(app).post('/auth/register').send({
      email,
      password,
      fullName: 'Test User',
    })

    expect(reg.status).toBe(201)
    const { token } = reg.body

    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name', locale: 'en' })

    expect(res.status).toBe(200)
    expect(res.body.data.full_name).toBe('Updated Name')
    expect(res.body.data.locale).toBe('en')
  })

  test('DELETE /users/me deletes the user (204) and subsequent /me is 404', async () => {
    const email = makeEmail('delete')
    createdEmails.push(email)

    // Register
    const reg = await request(app).post('/auth/register').send({
      email,
      password,
      fullName: 'To Delete',
    })

    expect(reg.status).toBe(201)
    const { token } = reg.body

    const del = await request(app).delete('/users/me').set('Authorization', `Bearer ${token}`)

    expect(del.status).toBe(204)

    // Token is still cryptographically valid, but user should be gone
    const after = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`)

    expect(after.status).toBe(404)
    expect(after.body?.error?.code).toBe('NOT_FOUND')
  })

  test('PATCH /users/:id/role returns 401 when no token', async () => {
    const res = await request(app).patch('/users/1/role').send({ role: 'host' })
    expect(res.status).toBe(401)
  })

  test('PATCH /users/:id/role returns 403 when not admin', async () => {
    const email = makeEmail('notadmin')
    createdEmails.push(email)

    const reg = await request(app).post('/auth/register').send({
      email,
      password,
      fullName: 'Not Admin',
    })

    expect(reg.status).toBe(201)

    const res = await request(app)
      .patch('/users/1/role')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ role: 'host' })

    expect(res.status).toBe(403)
    expect(res.body?.error?.code).toBe('FORBIDDEN')
  })

  test('PATCH /users/:id/role updates role when admin (200)', async () => {
    const email = makeEmail('promote')
    createdEmails.push(email)

    const reg = await request(app).post('/auth/register').send({
      email,
      password,
      fullName: 'To Promote',
    })

    expect(reg.status).toBe(201)

    // Admin is seeded in jest.setup.js as user id=3
    const adminToken = createToken({ id: 3, role: 'admin' })

    const promote = await request(app)
      .patch(`/users/${reg.body.user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'host' })

    expect(promote.status).toBe(200)
    expect(promote.body.data.role).toBe('host')

    // confirm user logs in and sees host role
    const login = await request(app).post('/auth/login').send({ email, password })
    expect(login.status).toBe(200)

    const me = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${login.body.token}`)

    expect(me.status).toBe(200)
    expect(me.body.data.role).toBe('host')
  })
})
