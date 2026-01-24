const request = require("supertest");
const app = require("../app");
const { query } = require("../db/pool");

describe("Spaces API", () => {
  let testHostUserId1
  let testHostUserId2

  beforeAll(async () => {

    // Create user with ID 1 for auth middleware stub
    await query(
    `INSERT INTO users (id, full_name, email, password_hash, role, locale)
     VALUES (1, 'Auth Stub User', 'stub@test.com', 'hashedpassword', 'host', 'en')
     ON CONFLICT (id) DO NOTHING`
  )

    // Create test host users before creating spaces
    const host1Result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      ['Test Host 1', 'host1@email', 'hashedpassword', 'host', 'en']
    )
    testHostUserId1 = host1Result.rows[0].id

    const host2Result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, locale)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      ['Test Host 2', 'host2@email', 'hashedpassword', 'host', 'en']    
    )
    testHostUserId2 = host2Result.rows[0].id
  })

  afterAll(async () => {
    await query('DELETE FROM spaces WHERE host_user_id IN ($1, $2)', [testHostUserId1, testHostUserId2])
    await query('DELETE FROM users WHERE id IN ($1, $2)', [testHostUserId1, testHostUserId2])
  })

  async function seedSpace({ hostUserId = testHostUserId1, name = 'Test Space'} = {}) {
    const { rows } = await query(
      `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [hostUserId, name, '', '1 Test Rd', 'Sydney', 'Australia', 10]
    )
    return rows[0]
  }

  test("Create (201)", async () => {
    const res = await request(app)
      .post('/spaces')
      .send({
        name: 'My Space',
        description: 'Nice',
        address: '1 Main St',
        city: 'Sydney',
        country: 'Australia',
        capacity: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBeTruthy();
    expect(res.body.data.name).toBe('My Space');
    expect(res.body.data.host_user_id).toBe(1);
  });

  test("Read list (200)", async () => {
    await seedSpace({ name: "Space A" });
    await seedSpace({ name: "Space B" });

    const res = await request(app).get('/spaces');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test("Read by id (200 / 404)", async () => {
    const space = await seedSpace({ name: "Space A" });

    const ok = await request(app).get(`/spaces/${space.id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.id).toBe(space.id);

    const missing = await request(app).get('/spaces/999999');
    expect(missing.status).toBe(404);
    expect(missing.body?.error?.code).toBeTruthy();
  });

  test("Update (200 / 403)", async () => {
    const owned = await seedSpace({ hostUserId: 1, name: 'Owned' }); // Using ID 1 instead to keep in with middleware
    const other = await seedSpace({ hostUserId: testHostUserId2, name: 'Not Mine' });

    // owned: should update
    const ok = await request(app)
      .patch(`/spaces/${owned.id}`)
      .send({ name: 'Updated Name' });

    expect(ok.status).toBe(200);
    expect(ok.body.data.name).toBe('Updated Name');

    // not owned: should 403
    const forbidden = await request(app)
      .patch(`/spaces/${other.id}`)
      .send({ name: 'Hack' });

    expect(forbidden.status).toBe(403);
    expect(forbidden.body?.error?.code).toBeTruthy();
  });

  test("Delete (204 / 403)", async () => {
    const owned = await seedSpace({ hostUserId: 1, name: 'Owned' });
    const other = await seedSpace({ hostUserId: testHostUserId2, name: 'Not Mine' });

    // not owned: 403
    const forbidden = await request(app).delete(`/spaces/${other.id}`);
    expect(forbidden.status).toBe(403);

    // owned: 204
    const ok = await request(app).delete(`/spaces/${owned.id}`);
    expect(ok.status).toBe(204);

    // should now be 404
    const after = await request(app).get(`/spaces/${owned.id}`);
    expect(after.status).toBe(404);
  });
});
