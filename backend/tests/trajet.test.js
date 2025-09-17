import request from "supertest";
import app from "../src/server.js";

describe("Trajets API", () => {
  it("GET /trajets powinno zwrócić listę trajets", async () => {
    const res = await request(app).get("/trajets");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /trajets/:id powinno zwrócić jeden trajet", async () => {
    const res = await request(app).get("/trajets/1");
    expect([200, 404]).toContain(res.statusCode);
  });
});
