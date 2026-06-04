import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });

import request from "supertest";
import app     from "../server.js";

// rest of file stays the same...
let adminToken      = "";
let studentToken    = "";

beforeAll(async () => {
  const [adminRes, stdRes] = await Promise.all([
    request(app).post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASS }),
    request(app).post("/api/auth/login")
      .send({ email: process.env.TEST_STD_EMAIL,   password: process.env.TEST_STD_PASS }),
  ]);

  adminToken   = adminRes.body.token;
  studentToken = stdRes.body.token;
});

// Always disable after tests so other tests are not affected
afterAll(async () => {
  await request(app)
    .post("/api/admin/maintenance")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ enabled: false });
});

describe("Maintenance Mode", () => {

  test("Admin can enable maintenance mode", async () => {
    const res = await request(app)
      .post("/api/admin/maintenance")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ enabled: true, reason: "Automated test" });

    expect(res.statusCode).toBe(200);
    expect(res.body.maintenance_mode).toBe(true);
    expect(res.body.maintenance_reason).toBe("Automated test");
  });

  test("Admin can disable maintenance mode", async () => {
    const res = await request(app)
      .post("/api/admin/maintenance")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ enabled: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.maintenance_mode).toBe(false);
  });

  test("Non-admin cannot toggle maintenance — returns 403", async () => {
    const res = await request(app)
      .post("/api/admin/maintenance")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ enabled: true });

    expect(res.statusCode).toBe(403);
  });

  test("Public endpoint returns chairman mode status", async () => {
    const res = await request(app)
      .get("/api/admin/system/chairman-mode/public");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("chairman_monitoring_mode");
    expect(typeof res.body.chairman_monitoring_mode).toBe("boolean");
  });

  test("Admin can toggle chairman mode ON", async () => {
    const res = await request(app)
      .post("/api/admin/system/chairman-mode")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ enabled: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.chairman_monitoring_mode).toBe(true);
  });

  test("Admin can toggle chairman mode OFF", async () => {
    const res = await request(app)
      .post("/api/admin/system/chairman-mode")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ enabled: false });

    expect(res.statusCode).toBe(200);
    expect(res.body.chairman_monitoring_mode).toBe(false);
  });

});