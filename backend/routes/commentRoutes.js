const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

// Submit a comment
router.post("/:foodId", async (req, res) => {
  const { foodId } = req.params;
  const { comment } = req.body;

  if (!comment) return res.status(400).json({ error: "Comment is required" });

  try {
    const newComment = await Comment.create({ foodId, comment });
    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get comments for a food
router.get("/:foodId", async (req, res) => {
  try {
    const comments = await Comment.find({ foodId: req.params.foodId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

module.exports = router;
