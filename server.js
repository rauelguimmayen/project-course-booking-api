require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const session      = require("express-session");
const path         = require("path");
const connectDB    = require("./config/db");
const authRoutes   = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const MongoStore   = require("connect-mongo");
const mongoose     = require("mongoose");
const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  // 1. Change the name to hide the tech stack
  name: 'app_session_id', 
  
  // 2. Use a strong secret (remove the hardcoded fallback)
  secret: process.env.SESSION_SECRET, 
  
  resave: false,
  saveUninitialized: false,
  
  cookie: {
    httpOnly: true, // Prevents JavaScript from reading the cookie
    secure: isProduction, // ONLY send over HTTPS in production
    sameSite: 'lax', // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: isProduction ? 'yourdomain.com' : undefined // Scope the cookie
  }
}));

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(__dirname,));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/courses", courseRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
