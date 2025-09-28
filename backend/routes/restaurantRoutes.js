const express = require("express");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

// ✅ 1. Get all restaurants (for user side)
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find(); // shows all
    res.json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// ✅ 2. Get restaurants created by a specific user (for admin side)
router.get("/restaurants/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const restaurants = await Restaurant.find({ createdBy: userId });
    res.json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching admin-specific restaurants:", err);
    res.status(500).json({ error: "Failed to fetch admin restaurants" });
  }
});

// ✅ 3. Create new restaurant
router.post("/restaurants", async (req, res) => {
  const { restaurantName, createdBy } = req.body;

  if (!restaurantName || !createdBy) {
    return res.status(400).json({ error: "Missing restaurant name or creator ID" });
  }

  try {
    const newRestaurant = new Restaurant({ restaurantName, createdBy });
    await newRestaurant.save();
    res.status(201).json({ message: "Restaurant created", restaurant: newRestaurant });
  } catch (err) {
    console.error("❌ Error creating restaurant:", err);
    res.status(500).json({ error: "Failed to create restaurant" });
  }
});

module.exports = router;
