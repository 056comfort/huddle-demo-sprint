import prisma from "../config/prisma";
import request from "supertest";
import app from "../app";

const testEmail = `jest-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";
const testName = "Jest Test User";

describe("Authentication API", () => {
  let token: string;

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      "User registered successfully"
    );

    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe(testName);
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should reject duplicate registration", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "An account with this email already exists",
    });
  });

  it("should reject an invalid login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid email or password",
    });
  });

  it("should successfully login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe(testName);
    expect(response.body.user.email).toBe(testEmail);

    token = response.body.token;
  });

  it("should return the authenticated user", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.name).toBe(testName);
    expect(response.body.user.email).toBe(testEmail);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});