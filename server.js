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

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  // 1. Point to your MongoDB
  store: new MongoStore({ 
    mongoUrl: process.env.MONGODB_STRING,
    // This ensures the session is saved to the DB before the warning triggers
    autoRemove: 'native' 
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
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