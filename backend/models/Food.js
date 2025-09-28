const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: false },
  restaurantName: { type: String, required: true }, // Store the restaurant name instead of ID
  active: { type: Boolean, default: true }, // ✅ Add this line
  rating: {
    type: Number, // 1 to 5
    min: 1,
    max: 5,
    required: false
}
});

module.exports = mongoose.model("Food", FoodSchema);
