require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const session      = require("express-session");
const path         = require("path");
const connectDB    = require("./config/db");
const authRoutes   = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const MongoStore   = require("connect-mongo").default;
const mongoose     = require("mongoose");
const app = express();

app.set("trust proxy", 1);
// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  // 1. Point to your MongoDB
  store: new MongoStore({ 
    mongoUrl: process.env.MONGODB_STRING,
    ttl: 60 * 60 * 24,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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