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
const validateEmail = async (req, res) => {
  if (!email || typeof email !== "string") return false;
  const val = email.trim();
  return (
    val.length > 0 &&
    val.length <= 254 &&
    /@/.test(val) &&
    val.split("@").length === 2 &&
    val.split("@")[1].length > 0 &&
    /\.[a-zA-Z]{2,}$/.test(val) &&
    /^[^\s@]+@[^\s@]+$/.test(val)
  );
}  

module.exports = { requireAuth, validateEmail };
