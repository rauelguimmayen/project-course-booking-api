const User = require("../models/User");


const requireAuth = async (req, res, next) => {
  const email = req.session?.userEmail;
  if (!email) return res.status(401).json({ error: "Not authenticated." });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found." });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth check failed." });
  }
};

// ═══════════════ EMAIL VALIDATION ═══════════════
const validateEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }

    const trimmed = email.trim();

    if (trimmed.length > 254) {
      return res.status(400).json({ error: "Email is too long." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    req.body.email = trimmed; // normalize before it hits the route
    next();
  } 

module.exports = { requireAuth, validateEmail };
