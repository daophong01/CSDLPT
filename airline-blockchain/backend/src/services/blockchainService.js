const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    const { ETHEREUM_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
    if (!ETHEREUM_RPC_URL || !CONTRACT_ADDRESS) {
      throw new Error("Missing ETHEREUM_RPC_URL or CONTRACT_ADDRESS");
    }
    this.provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
    this.wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, this.provider) : null;

    const abiPath = path.join(__dirname, "abi.json");
    const abi = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.wallet || this.provider);
  }

  async createFlight(flightData) {
    const { flightNumber, airline, departureAirport, arrivalAirport, departureTime, arrivalTime, totalSeats } = flightData;
    const tx = await this.contract.createFlight(flightNumber, airline, departureAirport, arrivalAirport, departureTime, arrivalTime, totalSeats);
    const receipt = await tx.wait();
    return { txHash: receipt.transactionHash };
  }

  async mintTicket(ticketData, buyerAddress) {
    const { flightId, passengerName, passportNumber, seatNumber, ticketClass, isTransferable } = ticketData;
    const price = await this.contract.calculateTicketPrice(ticketClass);
    const signer = this.wallet || (await this.provider.getSigner?.(buyerAddress));
    const c = this.contract.connect(signer);
    const tx = await c.mintTicket(flightId, passengerName, passportNumber, seatNumber, ticketClass, isTransferable, { value: price });
    const receipt = await tx.wait();
    const event = receipt.logs[0]; // simplified
    return { txHash: receipt.transactionHash, event };
  }

  async getTicketDetails(tokenId) {
    const [ticket, flight] = await this.contract.getTicketDetails(tokenId);
    return { ticket, flight };
  }

  async transferTicket(tokenId, fromAddress, toAddress, newPassengerName) {
    const signer = this.wallet || (await this.provider.getSigner?.(fromAddress));
    const tx = await this.contract.connect(signer).transferTicket(tokenId, toAddress, newPassengerName);
    const receipt = await tx.wait();
    return { txHash: receipt.transactionHash };
  }

  async checkIn(tokenId) {
    const tx = await this.contract.checkIn(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.transactionHash };
  }

  async cancelTicket(tokenId) {
    const tx = await this.contract.cancelTicket(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.transactionHash };
  }

  async getPassengerTickets(passengerAddress) {
    const tokenIds = await this.contract.getPassengerTickets(passengerAddress);
    return tokenIds;
  }

  async calculateTicketPrice(ticketClass) {
    const price = await this.contract.calculateTicketPrice(ticketClass);
    return price;
  }

  setupEventListeners(onEvent) {
    this.contract.on("FlightCreated", (flightId, flightNumber, airline, event) => {
      onEvent?.("FlightCreated", { flightId, flightNumber, airline, txHash: event.log.transactionHash });
    });
    this.contract.on("TicketMinted", (tokenId, flightId, passenger, price, event) => {
      onEvent?.("TicketMinted", { tokenId, flightId, passenger, price, txHash: event.log.transactionHash });
    });
    this.contract.on("TicketTransferred", (tokenId, from, to, newPassengerName, event) => {
      onEvent?.("TicketTransferred", { tokenId, from, to, newPassengerName, txHash: event.log.transactionHash });
    });
    this.contract.on("CheckInCompleted", (tokenId, passenger, event) => {
      onEvent?.("CheckInCompleted", { tokenId, passenger, txHash: event.log.transactionHash });
    });
    this.contract.on("TicketCancelled", (tokenId, passenger, refundAmount, event) => {
      onEvent?.("TicketCancelled", { tokenId, passenger, refundAmount, txHash: event.log.transactionHash });
    });
  }
}

module.exports = new BlockchainService();