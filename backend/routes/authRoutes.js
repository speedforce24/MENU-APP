const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminInvite = require("../models/AdminInvite");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const {
  inviteGenerateLimiter,
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
} = require("../middleware/rateLimiters");
const axios = require("axios");

const router = express.Router();

// Crockford-style base32 alphabet — avoids 0/O, 1/I/L, U
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const INVITE_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

const generateInviteCode = () => {
  const groups = Array.from({ length: 3 }, () => {
    const bytes = crypto.randomBytes(4);
    return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  });
  return `CHOP-${groups.join("-")}`;
};

// Constant-time compare for the bootstrap secret
const safeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Register
 *  - Open signup; any email, any domain.
 *  - If `inviteCode` is supplied AND valid → role=admin, mark code used.
 *  - If `inviteCode` matches ADMIN_BOOTSTRAP_CODE AND no admin exists yet → role=admin.
 *  - Otherwise role=user. We never say which branch we took — invalid codes silently
 *    create a student account so attackers can't probe for valid codes.
 */
router.post("/register", registerLimiter, async (req, res) => {
  const { name, email, password, inviteCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    let role = "user";
    let consumedInvite = null;

    if (inviteCode) {
      const trimmed = String(inviteCode).trim().toUpperCase();

      // Try a live invite first
      const invite = await AdminInvite.findOne({ code: trimmed });
      const now = new Date();
      if (
        invite &&
        !invite.usedBy &&
        invite.expiresAt > now
      ) {
        role = "admin";
        consumedInvite = invite;
      } else {
        // Fallback: bootstrap code works only if there are no admins yet
        const bootstrap = process.env.ADMIN_BOOTSTRAP_CODE;
        const adminsExist = await User.exists({ role: "admin" });
        if (bootstrap && safeEqual(trimmed, bootstrap.trim().toUpperCase()) && !adminsExist) {
          role = "admin";
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (consumedInvite) {
      consumedInvite.usedBy = newUser._id;
      consumedInvite.usedAt = new Date();
      await consumedInvite.save();
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Generate a single-use admin invite code. Admin-only.
 * The code is returned ONCE in this response and never again.
 */
router.post("/admin-invites", authMiddleware, adminMiddleware, inviteGenerateLimiter, async (req, res) => {
  try {
    // Loop in the vanishingly rare case of a collision on the unique index
    let saved = null;
    for (let i = 0; i < 5 && !saved; i++) {
      const code = generateInviteCode();
      try {
        saved = await AdminInvite.create({
          code,
          createdBy: req.user.id,
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
        });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    if (!saved) {
      return res.status(500).json({ error: "Could not generate a unique code" });
    }

    res.status(201).json({
      code: saved.code,
      expiresAt: saved.expiresAt,
      ttlHours: INVITE_TTL_MS / (60 * 60 * 1000),
    });
  } catch (err) {
    console.error("Invite generation error:", err);
    res.status(500).json({ error: "Failed to generate invite" });
  }
});

/**
 * List invite codes created by the calling admin.
 * Returns status and masks the code value (first 4 + last 4 only).
 */
router.get("/admin-invites", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const invites = await AdminInvite.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("usedBy", "name email");

    const now = new Date();
    const masked = invites.map((inv) => {
      const status = inv.usedBy
        ? "used"
        : inv.expiresAt < now
        ? "expired"
        : "active";
      const parts = inv.code.split("-");
      const maskedCode =
        parts.length === 4
          ? `${parts[0]}-${parts[1]}-••••-••••`
          : `${inv.code.slice(0, 4)}••••`;
      return {
        _id: inv._id,
        maskedCode,
        status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        usedBy: inv.usedBy ? { name: inv.usedBy.name, email: inv.usedBy.email } : null,
        usedAt: inv.usedAt,
      };
    });

    res.json(masked);
  } catch (err) {
    console.error("Invite list error:", err);
    res.status(500).json({ error: "Failed to list invites" });
  }
});

// ✅ Login Route
router.post("/login", loginLimiter, async (req, res) => {
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
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
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
