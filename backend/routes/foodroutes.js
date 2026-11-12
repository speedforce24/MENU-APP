const express = require("express");
const multer = require("multer");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { foodUploadLimiter } = require("../middleware/rateLimiters");
const {
  cloudinary,
  foodImageStorage,
  publicIdFromUrl,
} = require("../config/cloudinary");

const router = express.Router();

// 5 MB cap. Keeps Cloudinary quota predictable and blocks huge accidental uploads.
const upload = multer({
  storage: foodImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Wrap multer's middleware so any upload error (Cloudinary rejection,
 * oversize file, bad mimetype) is logged and returned as JSON instead
 * of being swallowed by Express's default 500 handler.
 */
const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("❌ Image upload middleware error:", err);
      return res.status(400).json({
        error: err.message || "Image upload failed",
      });
    }
    next();
  });
};

// Add Food Item (Only Admins) - Ensures restaurant exists
router.post(
  "/foods",
  authMiddleware,
  adminMiddleware,
  foodUploadLimiter,
  uploadImage,
  async (req, res) => {
    try {
      let { foodName, price, restaurantName } = req.body;

      if (!foodName || !price || !restaurantName) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Image upload failed" });
      }

      // req.file.path is the Cloudinary CDN URL (https://res.cloudinary.com/...)
      const imageUrl = req.file.path;

      let restaurant = await Restaurant.findOne({ restaurantName });
      if (!restaurant) {
        restaurant = new Restaurant({
          restaurantName,
          createdBy: req.user.id,
        });
        await restaurant.save();
      }

      const newFood = await Food.create({
        foodName,
        price,
        image: imageUrl,
        restaurantName: restaurantName.toString(),
        active: true,
      });

      res.status(201).json({ message: "Food added successfully", food: newFood });
    } catch (err) {
      console.error("❌ Error adding food:", err);
      res.status(500).json({ error: "Failed to upload food", details: err.message });
    }
  }
);

/**
 * Replace a food's image. Used to "re-hydrate" foods whose old local-disk
 * images were lost when Render wiped the filesystem on redeploy. Also just
 * nice to have for everyday image swaps.
 */
router.patch(
  "/foods/:foodId/image",
  authMiddleware,
  adminMiddleware,
  foodUploadLimiter,
  uploadImage,
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.foodId);
      if (!food) return res.status(404).json({ error: "Food not found" });
      if (!req.file) return res.status(400).json({ error: "No image uploaded" });

      const oldPublicId = publicIdFromUrl(food.image);
      food.image = req.file.path;
      await food.save();

      // Best-effort cleanup of the superseded Cloudinary asset. Don't fail
      // the request if the delete call errors — the new image is saved.
      if (oldPublicId) {
        cloudinary.uploader.destroy(oldPublicId).catch((e) => {
          console.warn("Cloudinary destroy failed for", oldPublicId, e.message);
        });
      }

      res.json({ message: "Image updated", food });
    } catch (err) {
      console.error("❌ Error replacing image:", err);
      res.status(500).json({ error: "Failed to replace image" });
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
// DELETE /api/foods/:id — also best-effort cleans up the Cloudinary asset.
router.delete("/foods/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (food) {
      const publicId = publicIdFromUrl(food.image);
      if (publicId) {
        cloudinary.uploader.destroy(publicId).catch((e) => {
          console.warn("Cloudinary destroy failed for", publicId, e.message);
        });
      }
    }
    res.json({ message: "Food deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});






module.exports = router;
