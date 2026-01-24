const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')

describe('Users API', () => {
  const email = `me+${Date.now()}@test.com`
  const password = 'password123'

  afterAll(async () => {
    await query('DELETE FROM users WHERE email = $1', [email])
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
    const { token } = login.body

    const res = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(email)
    expect(res.body.data.full_name).toBe('Test User')
  })
})
