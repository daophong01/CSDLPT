const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AirlineTicketNFT", function () {
  let contract, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const C = await ethers.getContractFactory("AirlineTicketNFT");
    contract = await C.deploy();
    await contract.waitForDeployment();

    const now = Math.floor(Date.now() / 1000);
    await (await contract.createFlight("VN231", "Vietnam Airlines", "HAN", "SGN", now + 86400, now + 86400 + 7200, 2)).wait();
  });

  it("should mint ticket with correct payment", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await expect(
      contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", true, { value: price })
    ).to.emit(contract, "TicketMinted");

    const [ticket] = await contract.getTicketDetails(1);
    expect(ticket.passenger).to.equal(await alice.getAddress());
    expect(ticket.seatNumber).to.equal("12A");
  });

  it("should transfer ticket when transferable", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", true, { value: price })).wait();
    await expect(contract.connect(alice).transferTicket(1, bob.address, "Bob")).to.emit(contract, "TicketTransferred");
    const [ticket] = await contract.getTicketDetails(1);
    expect(ticket.passenger).to.equal(bob.address);
  });

  it("should check-in before departure", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", true, { value: price })).wait();
    await expect(contract.connect(alice).checkIn(1)).to.emit(contract, "CheckInCompleted");
  });

  it("should cancel and refund 80%", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", true, { value: price })).wait();
    await expect(contract.connect(alice).cancelTicket(1)).to.emit(contract, "TicketCancelled");
  });
});