const router = require("express").Router();
const Ticket = require("../models/Ticket");
const blockchain = require("../services/blockchainService");

router.post("/book", async (req, res) => {
  try {
    const { flightId, passengerData, walletAddress } = req.body;
    const { passengerName, passportNumber, seatNumber, ticketClass, isTransferable } = passengerData;

    const r = await blockchain.mintTicket(
      { flightId, passengerName, passportNumber, seatNumber, ticketClass, isTransferable },
      walletAddress
    );

    // simplistic: tokenId unknown here without parsing events; clients typically read tx receipt
    const doc = await Ticket.create({
      tokenId: 0,
      flightId,
      passenger: walletAddress,
      passengerName,
      passportNumber,
      seatNumber,
      ticketClass,
      price: Number(ethers.formatEther(await blockchain.calculateTicketPrice(ticketClass))),
      transactionHash: r.txHash
    });

    res.json({ transactionHash: r.txHash, ticket: doc });
  } catch (e) {
    res.status(400).json({ error: e.message || "Book error" });
  }
});

router.get("/:tokenId", async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const info = await blockchain.getTicketDetails(tokenId);
    res.json(info);
  } catch (e) {
    res.status(404).json({ error: e.message || "Ticket not found" });
  }
});

router.post("/:tokenId/transfer", async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const { fromAddress, toAddress, newPassengerName } = req.body;
    const r = await blockchain.transferTicket(tokenId, fromAddress, toAddress, newPassengerName);
    res.json({ transactionHash: r.txHash });
  } catch (e) {
    res.status(400).json({ error: e.message || "Transfer error" });
  }
});

router.post("/:tokenId/checkin", async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const r = await blockchain.checkIn(tokenId);
    res.json({ transactionHash: r.txHash });
  } catch (e) {
    res.status(400).json({ error: e.message || "Checkin error" });
  }
});

router.post("/:tokenId/cancel", async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const r = await blockchain.cancelTicket(tokenId);
    res.json({ transactionHash: r.txHash });
  } catch (e) {
    res.status(400).json({ error: e.message || "Cancel error" });
  }
});

module.exports = router;