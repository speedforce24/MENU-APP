const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Use the authenticated user id when available, else fall back to IP.
// `ipKeyGenerator` handles IPv6 correctly (groups a /64 together so an
// attacker can't rotate addresses within their own subnet to dodge limits).
const perUserKey = (req, res) =>
  (req.user && req.user.id) || ipKeyGenerator(req, res);

const baseOptions = {
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
};

// Admin-only invite generation. Cheap to the user, expensive if abused.
const inviteGenerateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 1,
  keyGenerator: perUserKey,
  message: {
    error: "You're generating invites too fast. Wait a minute, then try again.",
  },
});

// Public signup. IP-keyed. Stops bulk fake account creation.
const registerLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: {
    error: "Too many signups from this network. Try again in a few minutes.",
  },
});

// Login. IP-keyed. Slows credential stuffing.
const loginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many login attempts. Wait a few minutes and try again.",
  },
});

// Forgot password. Guards our email credits.
const forgotPasswordLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 3,
  message: {
    error: "Too many reset requests. Check your inbox, then try again later.",
  },
});

// Admin food upload. Per-user, generous but not infinite.
const foodUploadLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: perUserKey,
  message: {
    error:
      "Easy there — you can upload up to 10 foods per minute. Wait a bit and try again.",
  },
});

module.exports = {
  inviteGenerateLimiter,
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  foodUploadLimiter,
};
