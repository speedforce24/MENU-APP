const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // This ensures a restaurant can't be created without an associated user
  },
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
