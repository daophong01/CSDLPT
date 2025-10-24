jest.mock("../src/services/blockchainService", () => ({
  createFlight: jest.fn(),
  mintTicket: jest.fn(async () => ({ txHash: "0xabc" })),
  getTicketDetails: jest.fn(async (id) => ({ ticket: { passenger: "0xabc", seatNumber: "12A" }, flight: { flightNumber: "VN231" } })),
  transferTicket: jest.fn(async () => ({ txHash: "0xdef" })),
  checkIn: jest.fn(async () => ({ txHash: "0xghi" })),
  cancelTicket: jest.fn(async () => ({ txHash: "0xjkl" })),
  getPassengerTickets: jest.fn(async () => [1, 2]),
  calculateTicketPrice: jest.fn(async () => 10000000000000000n) // 0.01 ETH
}));

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");

describe("Tickets API", () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/airline-blockchain-test";
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("book ticket", async () => {
    const res = await request(app).post("/api/tickets/book").send({
      flightId: 0,
      walletAddress: "0xabc",
      passengerData: { passengerName: "Alice", passportNumber: "P123", seatNumber: "12A", ticketClass: "ECONOMY", isTransferable: true }
    });
    expect(res.status).toBe(200);
    expect(res.body.transactionHash).toBeDefined();
  });

  it("get ticket details", async () => {
    const res = await request(app).get("/api/tickets/1");
    expect(res.status).toBe(200);
    expect(res.body.ticket).toBeDefined();
    expect(res.body.flight).toBeDefined();
  });

  it("transfer ticket", async () => {
    const res = await request(app).post("/api/tickets/1/transfer").send({ fromAddress: "0xabc", toAddress: "0xdef", newPassengerName: "Bob" });
    expect(res.status).toBe(200);
    expect(res.body.transactionHash).toBeDefined();
  });

  it("checkin ticket", async () => {
    const res = await request(app).post("/api/tickets/1/checkin");
    expect(res.status).toBe(200);
    expect(res.body.transactionHash).toBeDefined();
  });

  it("cancel ticket", async () => {
    const res = await request(app).post("/api/tickets/1/cancel");
    expect(res.status).toBe(200);
    expect(res.body.transactionHash).toBeDefined();
  });
});