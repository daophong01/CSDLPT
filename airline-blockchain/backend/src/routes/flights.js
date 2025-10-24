const router = require("express").Router();
const Flight = require("../models/Flight");
const blockchain = require("../services/blockchainService");

router.post("/search", async (req, res) => {
  try {
    const { from, to, departureDate, class: cls } = req.body || {};
    const q = {};
    if (from) q.departureAirport = from.toUpperCase();
    if (to) q.arrivalAirport = to.toUpperCase();
    if (departureDate) {
      const start = new Date(departureDate);
      const end = new Date(departureDate);
      end.setDate(end.getDate() + 1);
      q.departureTime = { $gte: start, $lt: end };
    }
    const flights = await Flight.find(q).sort({ departureTime: 1 }).limit(100);
    res.json({ flights });
  } catch (e) {
    res.status(500).json({ error: e.message || "Search error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const r = await blockchain.createFlight({
      ...data,
      departureTime: Math.floor(new Date(data.departureTime).getTime() / 1000),
      arrivalTime: Math.floor(new Date(data.arrivalTime).getTime() / 1000)
    });
    res.json({ txHash: r.txHash });
  } catch (e) {
    res.status(400).json({ error: e.message || "Create flight error" });
  }
});

module.exports = router;