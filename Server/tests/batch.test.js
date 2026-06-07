import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });

import request    from "supertest";
import app        from "../server.js";
import Maintaince from "../Models/Maintaince.js";

let adminToken = "";

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASS });
  adminToken = res.body.token;
  await Maintaince.updateOne({}, { $set: { maintenance_mode: false } });
});

afterEach(async () => {
  await Maintaince.updateOne({}, { $set: { maintenance_mode: false } });
});

describe("Batches — Get Available", () => {

  test("Admin can get all available batches", async () => {
    const res = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("batches");
    expect(Array.isArray(res.body.batches)).toBe(true);
  });

  test("Get batches without token returns 401", async () => {
    const res = await request(app).get("/api/admin/batches");
    expect(res.statusCode).toBe(401);
  });

  test("Batches are sorted descending (newest first)", async () => {
    const res = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const batches = res.body.batches;
    if (batches.length >= 2) {
      expect(batches[0] >= batches[1]).toBe(true);
    }
  });

  test("Batch format is correct (e.g. 2025-26)", async () => {
    const res = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    res.body.batches.forEach(b => {
      expect(b).toMatch(/^\d{4}-\d{2}$/);
    });
  });

});

describe("Batches — Students Filter", () => {

  test("Get all students without batch filter", async () => {
    const res = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get students filtered by specific batch", async () => {
    const batchRes = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    const batch = batchRes.body.batches?.[0];
    if (!batch) return;

    const res = await request(app)
      .get(`/api/admin/students?batch=${batch}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(s => {
      expect(s.batch).toBe(batch);
    });
  });

  test("Get students with batch=all returns all students", async () => {
    const allRes = await request(app)
      .get("/api/admin/students")
      .set("Authorization", `Bearer ${adminToken}`);

    const batchAllRes = await request(app)
      .get("/api/admin/students?batch=all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(allRes.statusCode).toBe(200);
    expect(batchAllRes.statusCode).toBe(200);
    expect(batchAllRes.body.length).toBe(allRes.body.length);
  });

  test("Get students with non-existent batch returns empty array", async () => {
    const res = await request(app)
      .get("/api/admin/students?batch=1900-01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});

describe("Batches — Groups Filter", () => {

  test("Get all groups without batch filter", async () => {
    const res = await request(app)
      .get("/api/admin/groups")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get groups filtered by batch", async () => {
    const batchRes = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    const batch = batchRes.body.batches?.[0];
    if (!batch) return;

    const res = await request(app)
      .get(`/api/admin/groups?batch=${batch}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get groups with non-existent batch returns empty array", async () => {
    const res = await request(app)
      .get("/api/admin/groups?batch=1900-01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});

describe("Batches — Supervisors Filter", () => {

  test("Get all supervisors without batch filter", async () => {
    const res = await request(app)
      .get("/api/admin/supervisors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Get supervisors filtered by batch", async () => {
    const batchRes = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    const batch = batchRes.body.batches?.[0];
    if (!batch) return;

    const res = await request(app)
      .get(`/api/admin/supervisors?batch=${batch}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});

describe("Batches — Dashboard Stats Filter", () => {

  test("Get stats without batch filter", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body.stats).toHaveProperty("students");
    expect(res.body.stats).toHaveProperty("supervisors");
    expect(res.body.stats).toHaveProperty("teams");
  });

  test("Get stats filtered by batch returns correct shape", async () => {
    const batchRes = await request(app)
      .get("/api/admin/batches")
      .set("Authorization", `Bearer ${adminToken}`);

    const batch = batchRes.body.batches?.[0];
    if (!batch) return;

    const res = await request(app)
      .get(`/api/admin/stats?batch=${batch}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.students).toBeGreaterThanOrEqual(0);
    expect(res.body.stats.supervisors).toBeGreaterThanOrEqual(0);
    expect(res.body.stats.teams).toBeGreaterThanOrEqual(0);
  });

  test("Stats with non-existent batch returns zeros", async () => {
    const res = await request(app)
      .get("/api/admin/stats?batch=1900-01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.stats.students).toBe(0);
    expect(res.body.stats.teams).toBe(0);
  });

  test("Stats without token returns 401", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.statusCode).toBe(401);
  });

});