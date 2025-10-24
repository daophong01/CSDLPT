const router = require("express").Router();
const Ticket = require("../models/Ticket");
const Flight = require("../models/Flight");

router.get("/dashboard", async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const activeFlights = await Flight.countDocuments({ status: "ACTIVE" });

    const revenueAgg = await Ticket.aggregate([
      { $group: { _id: "$ticketClass", total: { $sum: "$price" }, count: { $sum: 1 } } }
    ]);

    const topRoutes = await Flight.aggregate([
      { $group: { _id: { from: "$departureAirport", to: "$arrivalAirport" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      metrics: { totalTickets, activeFlights },
      revenueByClass: revenueAgg,
      topRoutes
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Analytics error" });
  }
});

module.exports = router;