const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  value: { type: Number, required: true },
});

ratingSchema.index({ userId: 1, foodId: 1 }, { unique: true }); // So a user can rate a food only once

module.exports = mongoose.model("Rating", ratingSchema);
