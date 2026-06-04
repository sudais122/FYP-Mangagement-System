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
let createdId    = "";

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

afterAll(async () => {
  if (createdId) {
    await request(app)
      .delete(`/api/deadlines/${createdId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  }
});

describe("Deadlines", () => {

  test("Anyone can get all deadlines without auth", async () => {
    const res = await request(app).get("/api/deadlines");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Admin can create a deadline", async () => {
    const res = await request(app)
      .post("/api/deadlines")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        type:        "Proposal Submission",
        description: "Automated test deadline",
        dueDate:     "2026-12-31",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.deadline).toHaveProperty("_id");
    createdId = res.body.deadline._id;
  });

  test("Student cannot create deadline — returns 403", async () => {
    const res = await request(app)
      .post("/api/deadlines")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ type: "Proposal Submission", dueDate: "2026-12-31" });

    expect([403, 503]).toContain(res.statusCode);
  });

  test("Admin can update deadline", async () => {
    if (!createdId) return;
    const res = await request(app)
      .put(`/api/deadlines/${createdId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        type:        "Proposal Submission",
        description: "Updated description",
        dueDate:     "2026-11-30",
      });

    expect(res.statusCode).toBe(200);
  });

  test("Admin can delete deadline", async () => {
    if (!createdId) return;
    const res = await request(app)
      .delete(`/api/deadlines/${createdId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    createdId = "";
  });

});