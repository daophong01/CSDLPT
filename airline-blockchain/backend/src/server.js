require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const { MONGODB_URI, PORT = 3001 } = process.env;

mongoose.connect(MONGODB_URI).then(() => {
  console.log("MongoDB connected");
}).catch((e) => {
  console.error("MongoDB connect error:", e.message || e);
  process.exit(1);
});

// Routes
app.use("/api/flights", require("./routes/flights"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/users", require("./routes/users"));
app.use("/api/analytics", require("./routes/analytics"));

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});