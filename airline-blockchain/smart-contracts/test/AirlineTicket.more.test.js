const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AirlineTicketNFT Edge Cases", function () {
  let contract, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const C = await ethers.getContractFactory("AirlineTicketNFT");
    contract = await C.deploy();
    await contract.waitForDeployment();

    const now = Math.floor(Date.now() / 1000);
    await (await contract.createFlight("VN231", "Vietnam Airlines", "HAN", "SGN", now + 86400, now + 86400 + 7200, 1)).wait();
  });

  it("should reject invalid class", async () => {
    await expect(contract.calculateTicketPrice("PREMIUM")).to.be.rejectedWith("invalid class");
  });

  it("should enforce seat taken", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", true, { value: price })).wait();
    await expect(
      contract.connect(bob).mintTicket(0, "Bob", "P999", "12A", "ECONOMY", true, { value: price })
    ).to.be.revertedWith("seat taken");
  });

  it("should reject transfer if non-transferable", async () => {
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(0, "Alice", "P123", "12A", "ECONOMY", false, { value: price })).wait();
    await expect(contract.connect(alice).transferTicket(1, bob.address, "Bob")).to.be.revertedWith("non-transferable");
  });

  it("should reject check-in too late", async () => {
    // create short-time flight
    const now = Math.floor(Date.now() / 1000);
    await (await contract.createFlight("VN999", "VN", "HAN", "SGN", now + 3600, now + 7200, 1)).wait();
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(1, "Alice", "P123", "1A", "ECONOMY", true, { value: price })).wait();
    // simulate time closer than 2h -> checkIn too late
    await expect(contract.connect(alice).checkIn(2)).to.be.revertedWith("check-in too late");
  });

  it("should reject cancel too late", async () => {
    const now = Math.floor(Date.now() / 1000);
    await (await contract.createFlight("VN888", "VN", "HAN", "SGN", now + 21600, now + 28800, 1)).wait(); // dep in 6h
    const price = await contract.calculateTicketPrice("ECONOMY");
    await (await contract.connect(alice).mintTicket(2, "Alice", "P123", "2A", "ECONOMY", true, { value: price })).wait();
    await expect(contract.connect(alice).cancelTicket(3)).to.be.revertedWith("cancellation too late");
  });
});