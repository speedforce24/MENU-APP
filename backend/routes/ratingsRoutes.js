// routes/ratingRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Rating = require("../models/Rating");

// Submit or update rating
router.post("/:foodId", async (req, res) => {
  const { foodId } = req.params;
  const { userId, value } = req.body;

  try {
    const updated = await Rating.findOneAndUpdate(
      { foodId, userId },
      { value },
      { upsert: true, new: true }
    );

    res.json({ success: true, rating: updated });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get user's rating for a food
router.get("/:foodId/user/:userId", async (req, res) => {
  const { foodId, userId } = req.params;

  try {
    const rating = await Rating.findOne({ foodId, userId });
    res.json({ value: rating?.value || 0 });
  } catch (err) {
    console.error("Rating fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET: Average rating of a food
router.get("/:foodId/average", async (req, res) => {
  const { foodId } = req.params;

  try {
    const result = await Rating.aggregate([
      { $match: { foodId: new mongoose.Types.ObjectId(foodId) } },
      { $group: { _id: "$foodId", average: { $avg: "$value" } } }
    ]);

    res.json({ average: result[0]?.average || 0 });
  } catch (err) {
    console.error("Avg rating error:", err);
    res.status(500).json({ error: "Could not fetch average rating" });
  }
});

module.exports = router;
