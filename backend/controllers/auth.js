const bcrypt      = require("bcryptjs");
const User        = require("../models/User");
const requireAuth = require("../middleware/auth");

const SALT_ROUNDS = 10;

//User Registration
module.exports.registerUser = async (req, res) => {
	  const { name, email, password } = req.body;
	  if (!name || !email || !password)
	    return res.status(400).json({ error: "All fields are required." });
	  if (password.length < 6)
	    return res.status(400).json({ error: "Password must be at least 6 characters." });
	  try {
	    if (await User.findOne({ email }))
	      return res.status(409).json({ error: "An account with this email already exists." });
	    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	    const user = await User.create({ name, email, password: hashedPassword });
	    req.session.userEmail = user.email;
	    res.status(201).json({ name: user.name, email: user.email, enrolled: user.enrolled, joinedAt: user.joinedAt });
	  } catch (err) {
	    res.status(500).json({ error: err.message });
	  }
	};

//User Login
module.exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Incorrect email or password." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Incorrect email or password." });
    req.session.userEmail = user.email;
    res.json({ name: user.name, email: user.email, enrolled: user.enrolled, joinedAt: user.joinedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//User Logout
module.exports.userLogout = (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out." }));
};