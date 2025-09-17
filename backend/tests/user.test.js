import request from "supertest";
import app from "../src/server.js";

describe("Users API", () => {
  it("POST /users/register tworzy nowego użytkownika", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({
        pseudo: "TestUser",
        email: "test@example.com",
        password: "secret123",
      });

    expect([201, 409]).toContain(res.statusCode);
  });
});
