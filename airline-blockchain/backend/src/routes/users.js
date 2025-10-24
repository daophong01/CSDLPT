const router = require("express").Router();
const User = require("../models/User");
const blockchain = require("../services/blockchainService");

router.get("/:address/tickets", async (req, res) => {
  try {
    const address = req.params.address;
    const ids = await blockchain.getPassengerTickets(address);
    res.json({ tokenIds: ids });
  } catch (e) {
    res.status(400).json({ error: e.message || "Get tickets error" });
  }
});

module.exports = router;