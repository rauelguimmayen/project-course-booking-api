require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const session      = require("express-session");
const path         = require("path");
const connectDB    = require("./config/db");
const authRoutes   = require("./routes/auth");
const courseRoutes = require("./routes/courses");

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

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
