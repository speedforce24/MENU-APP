const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  console.log("Received Auth Header:", authHeader); // Debugging log

  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied, No Token Provided" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  console.log("Extracted Token:", token); // Debugging log

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    console.log("Verified User:", verified); // Debugging log
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid Token" });
  }
};

const adminMiddleware = (req, res, next) => {
  console.log("Checking Admin Role:", req.user); // Debugging log

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access Denied, Admin Only" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
