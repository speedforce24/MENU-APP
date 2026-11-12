require("dotenv").config();

// Dev-only DNS workaround.
// On some Windows setups (e.g. Docker Desktop leftover entries after a
// Windows network-stack update) Node's resolver picks up a dead
// 127.0.0.1 DNS server and fails every SRV lookup with ECONNREFUSED.
// Setting PIN_DNS in .env (comma-separated list) forces Node to use
// those resolvers instead. Leave PIN_DNS unset in production so the
// platform's own resolvers are used.
if (process.env.PIN_DNS) {
  require("dns").setServers(
    process.env.PIN_DNS.split(",").map((s) => s.trim()).filter(Boolean)
  );
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodroutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const ratingRoutes = require("./routes/ratingsRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Lightweight health/warm-up endpoint (used by frontend to wake Render cold starts)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", time: Date.now() });
});

app.use("/api/auth", authRoutes);
app.use("/api", foodRoutes);
app.use("/api", restaurantRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/comments", commentRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
