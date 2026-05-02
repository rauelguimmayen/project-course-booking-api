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

function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required." };
  }

  const trimmed = email.trim();

  // Must follow standard email format: local@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: "Invalid email format." };
  }

  if (trimmed.length > 254) {
    return { valid: false, message: "Email is too long." };
  }

  return { valid: true, message: "Email is valid." };
}
module.exports = {requireAuth , validateEmail};
