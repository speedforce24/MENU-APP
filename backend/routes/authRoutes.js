const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const axios = require('axios');


const router = express.Router();

// ✅ Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

if (role === 'admin' && !email.endsWith('@gmail.com')) {
  return res.status(400).json({ message: 'Only @gmail.com emails are allowed for admins' });
}

if (role === 'user' && !email.endsWith('@yopmail.com')) {
  return res.status(400).json({ message: 'Only @yopmail.com emails are allowed for students' });
}

  try {
    

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create New User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default role to "user"
    });

    await newUser.save();
    console.log("✅ User registered:", newUser); // Debugging log

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  console.log("🔹 Login route hit!"); // ✅ Log if route is reached
  console.log("📨 Received Data:", req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }
  const user = await User.findOne({ email });
   
    console.log("🔍 Found User:", user); // ✅ Check if user exists

    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ error: "User not found" });
    }

    // Ensure role is present
    if (!user.role) {
      console.log("⚠️ Warning: User role is missing for:", email);
      return res.status(500).json({ error: "Role not found for user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password does not match for:", email);
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
     const { password: _, ...safeUser } = user.toObject();


    console.log("✅ Login successful for:", email);
    console.log("🟢 Sending Login Response:", { token, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role, 
      user:safeUser,// ✅ Ensure role is sent
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate JWT reset token
   if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});


    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email using Resend API
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Password Reset Request',
        text: `Click on the following link to reset your password: ${resetLink}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_USER}`, // EMAIL_USER = your API key
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract user ID from token

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Find the user and update the password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Set the new password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;
