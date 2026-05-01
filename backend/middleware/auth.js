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

module.exports = requireAuth;
