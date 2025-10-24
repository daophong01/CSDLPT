const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  tokenId: { type: Number, index: true, required: true, unique: true },
  flightId: { type: Number, index: true, required: true },
  passenger: { type: String, index: true, required: true },
  passengerName: { type: String, required: true },
  passportNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  ticketClass: { type: String, required: true },
  price: { type: Number, required: true },
  paymentStatus: { type: String, default: "SUCCESS" },
  bookingStatus: { type: String, default: "CONFIRMED" },
  transactionHash: { type: String },
  blockNumber: { type: Number }
}, { timestamps: true });

TicketSchema.index({ passenger: 1, tokenId: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);