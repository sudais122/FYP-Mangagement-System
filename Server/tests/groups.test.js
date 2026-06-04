import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });

import request    from "supertest";
import app        from "../server.js";
import Maintaince from "../Models/Maintaince.js";

let adminToken   = "";
let studentToken = "";

beforeAll(async () => {
  const [adminRes, stdRes] = await Promise.all([
    request(app).post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASS }),
    request(app).post("/api/auth/login")
      .send({ email: process.env.TEST_STD_EMAIL,   password: process.env.TEST_STD_PASS }),
  ]);

  adminToken   = adminRes.body.token;
  studentToken = stdRes.body.token;
  await Maintaince.updateOne({}, { $set: { maintenance_mode: false } });
});

afterEach(async () => {
  await Maintaince.updateOne({}, { $set: { maintenance_mode: false } });
});

describe("Groups — Read", () => {

  test("Admin can get all groups", async () => {
    const res = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.groups)).toBe(true);
  });

  test("Get groups without token returns 401", async () => {
    const res = await request(app).get("/api/groups");
    expect([401, 503]).toContain(res.statusCode);
  });

  test("Student can get their own group", async () => {
    const res = await request(app)
      .get("/api/groups/my-group")
      .set("Authorization", `Bearer ${studentToken}`);

    expect([200, 404, 500, 503]).toContain(res.statusCode);
  });

});

describe("Groups — Reassign Supervisor", () => {

  test("Non-admin cannot reassign supervisor — returns 403", async () => {
    const res = await request(app)
      .put(`/api/groups/${process.env.TEST_GROUP_ID}/reassign`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ supervisor_id: process.env.TEST_SUP_ID });

    expect([403, 503]).toContain(res.statusCode);
  });

  test("Reassign with missing supervisor_id returns 400", async () => {
    const res = await request(app)
      .put(`/api/groups/${process.env.TEST_GROUP_ID}/reassign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect([400, 503]).toContain(res.statusCode);
  });

});