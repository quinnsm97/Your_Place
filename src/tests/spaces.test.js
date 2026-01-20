import request from "supertest";
import app from "../app.js";
import { query } from "../db/pool.js";

async function seedSpace({ hostUserId = 1, name = "Test Space" } = {}) {
  const { rows } = await query(
    `INSERT INTO spaces (host_user_id, name, description, address, city, country, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [hostUserId, name, "", "1 Test St", "Sydney", "Australia", 10]
  );
  return rows[0];
}

describe("Spaces API", () => {
  test("Create (201)", async () => {
    const res = await request(app)
      .post("/spaces")
      .send({
        name: "My Space",
        description: "Nice",
        address: "1 Main St",
        city: "Sydney",
        country: "Australia",
        capacity: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body?.data?.id).toBeTruthy();
    expect(res.body.data.name).toBe("My Space");
    expect(res.body.data.host_user_id).toBe(1);
  });

  test("Read list (200)", async () => {
    await seedSpace({ name: "Space A" });
    await seedSpace({ name: "Space B" });

    const res = await request(app).get("/spaces");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test("Read by id (200 / 404)", async () => {
    const space = await seedSpace({ name: "Space A" });

    const ok = await request(app).get(`/spaces/${space.id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.id).toBe(space.id);

    const missing = await request(app).get("/spaces/999999");
    expect(missing.status).toBe(404);
    expect(missing.body?.error?.code).toBeTruthy();
  });

  test("Update (200 / 403)", async () => {
    const owned = await seedSpace({ hostUserId: 1, name: "Owned" });
    const other = await seedSpace({ hostUserId: 2, name: "Not Mine" });

    // owned: should update
    const ok = await request(app)
      .patch(`/spaces/${owned.id}`)
      .send({ name: "Updated Name" });

    expect(ok.status).toBe(200);
    expect(ok.body.data.name).toBe("Updated Name");

    // not owned: should 403
    const forbidden = await request(app)
      .patch(`/spaces/${other.id}`)
      .send({ name: "Hack" });

    expect(forbidden.status).toBe(403);
    expect(forbidden.body?.error?.code).toBeTruthy();
  });

  test("Delete (204 / 403)", async () => {
    const owned = await seedSpace({ hostUserId: 1, name: "Owned" });
    const other = await seedSpace({ hostUserId: 2, name: "Not Mine" });

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
