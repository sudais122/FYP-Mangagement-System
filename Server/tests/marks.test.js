import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath }    from "url";
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.test"), override: true });

import request from "supertest";
import app     from "../server.js";

describe("Auth — Login", () => {

  test("Admin login returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASS });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.role).toBe("admin");
  });

  test("Supervisor login returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_SUP_EMAIL, password: process.env.TEST_SUP_PASS });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Student login returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_STD_EMAIL, password: process.env.TEST_STD_PASS });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.role).toBe("student");
  });

  test("Wrong password returns 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL, password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("Missing password returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.TEST_ADMIN_EMAIL });

    expect(res.statusCode).toBe(400);
  });

  test("Missing email returns 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "somepassword" });

    expect(res.statusCode).toBe(400);
  });

  test("Non-existent email returns 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@awkum.edu.pk", password: "Test@1234" });

    expect(res.statusCode).toBe(401);
  });

});