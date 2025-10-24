const mongoose = require("mongoose");

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, index: true, required: true },
  airline: { type: String, required: true },
  departureAirport: { type: String, index: true, required: true },
  arrivalAirport: { type: String, index: true, required: true },
  departureTime: { type: Date, index: true, required: true },
  arrivalTime: { type: Date, required: true },
  aircraft: { type: String },
  pricing: {
    economy: { type: Number, default: 0.01 },
    business: { type: Number, default: 0.03 },
    first: { type: Number, default: 0.05 }
  },
  availableSeats: {
    economy: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    first: { type: Number, default: 0 }
  },
  status: { type: String, default: "ACTIVE" },
  blockchainId: { type: Number, index: true }
}, { timestamps: true });

module.exports = mongoose.model("Flight", FlightSchema);