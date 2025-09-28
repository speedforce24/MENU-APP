const express = require("express");
const multer = require("multer");
const path = require("path");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const Rating = require("../models/Rating");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Serve uploaded images
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Add Food Item (Only Admins) - Ensures restaurant exists
router.post(
  "/foods",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("📥 Received food data:", req.body);
      console.log("🖼 File uploaded:", req.file);

      let { foodName, price, restaurantName } = req.body;

      // Validate required fields
      if (!foodName || !price || !restaurantName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Ensure an image was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "Image upload failed" });
      }

      // Check if restaurant exists, else create it
      let restaurant = await Restaurant.findOne({ restaurantName });
      if (!restaurant) {
        restaurant = new Restaurant({ restaurantName });
        await restaurant.save();
        console.log("✅ New restaurant created:", restaurant);
      }
      restaurantName = restaurantName.toString();

      // Save the food item
      const newFood = new Food({
        foodName,
        price,
        image: `/uploads/${req.file.filename}`,
        restaurantName,
        active: true, // default active when created
      });

      await newFood.save();
      res.status(201).json({ message: "Food added successfully", food: newFood });
    } catch (err) {
      console.error("❌ Error adding food:", err);
      res.status(500).json({ error: "Failed to upload food", details: err.message });
    }
  }
);

// Toggle Food active/inactive (Only Admins)
router.patch(
  "/foods/:foodId/toggle",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.foodId);
      if (!food) return res.status(404).json({ error: "Food not found" });

      // Toggle active status or explicitly set from request body if provided
      if (typeof req.body.active === "boolean") {
        food.active = req.body.active;
      } else {
        food.active = !food.active;
      }

      await food.save();

      res.json({ message: "Food status updated", active: food.active });
    } catch (err) {
      console.error("❌ Error toggling food status:", err);
      res.status(500).json({ error: "Failed to toggle food status" });
    }
  }
);

// Fetch all restaurants
router.get("/restaurants", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Fetching all restaurants...");
    
    const restaurants = await Restaurant.find();
    
    res.json(restaurants);
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// Fetch food by restaurant name
router.get("/foods/:restaurantName", authMiddleware, async (req, res) => {
  try {
    console.log("📥 Fetching food for restaurant:", req.params.restaurantName);

    const foods = await Food.find({ restaurantName: req.params.restaurantName });

    res.json(foods);
  } catch (err) {
    console.error("❌ Error fetching food items:", err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});
// DELETE /api/foods/:id
router.delete("/foods/:id",authMiddleware,adminMiddleware, async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});






module.exports = router;
