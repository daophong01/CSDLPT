const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");

describe("Backend API", () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/airline-blockchain-test";
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("health endpoint", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("search flights without data", async () => {
    const res = await request(app).post("/api/flights/search").send({ from: "HAN", to: "SGN" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("flights");
    expect(Array.isArray(res.body.flights)).toBe(true);
  });
});