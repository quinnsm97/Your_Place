const request = require('supertest')
const app = require('../app')
const { query } = require('../db/pool')

describe('Auth API', () => {
  const email = `auth+${Date.now()}@test.com`
  const password = 'password123'

  afterAll(async () => {
    await query('DELETE FROM users WHERE email = $1', [email])
  })

  test('Register user (201)', async () => {
    const res = await request(app).post('/auth/register').send({
      email,
      password,
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(email)
  })

  test('Login user (200)', async () => {
    const res = await request(app).post('/auth/login').send({
      email,
      password,
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  test('Access /users/me with token (200)', async () => {
    const login = await request(app).post('/auth/login').send({
      email,
      password,
    })

    const token = login.body.token

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe(email)
  })
})