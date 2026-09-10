import request from "supertest";
import app from "../app";

describe("Health Check", () => {
  it("should return a successful health check", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Huddle API is running",
    });
  });
});

describe("Authentication Protection", () => {
  it("should reject requests without a token", async () => {
    const response = await request(app)
      .get("/api/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Authentication required",
    });
  });

  it("should reject an invalid token", async () => {
    const response = await request(app)
      .get("/api/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid or expired token",
    });
  });
});
