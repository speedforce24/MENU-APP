const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Added name field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }, // Role management

  // ✅ Added for Forgot Password functionality
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
