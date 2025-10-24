const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, index: true, unique: true, required: true },
  email: { type: String },
  name: { type: String },
  tickets: { type: [Number], default: [] },
  loyaltyPoints: { type: Number, default: 0 },
  membershipTier: { type: String, default: "BRONZE" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);