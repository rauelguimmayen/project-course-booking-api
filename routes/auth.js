const express     = require("express");
const router      = express.Router();
const bcrypt      = require("bcryptjs");
const User        = require("../models/User");
const requireAuth = require("../middleware/auth");
const userController = require("../controllers/auth");


// POST /api/auth/register
router.post("/register", userController.registerUser);

// POST /api/auth/login
router.post("/login", userController.userLogin);

// POST /api/auth/logout
router.post("/logout", userController.userLogout);

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const { name, email, enrolled, joinedAt } = req.user;
  res.json({ name, email, enrolled, joinedAt });
});

module.exports = router;