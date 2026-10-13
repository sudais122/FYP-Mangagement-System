import dotenv from "dotenv";
import path   from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
import express    from "express";
import cors       from "cors";
import connectDB  from "./config/db.js";

import authRoutes       from "./Routes/authRoutes.js";
import studentRoutes    from "./Routes/studentRoutes.js";
import groupRoutes      from "./Routes/groupRoutes.js";
import marksRoutes      from "./Routes/marksRoutes.js";
import deadlineRoutes   from "./Routes/deadlineRoutes.js";
import supervisorRoutes from "./Routes/supervisorRoutes.js";
import adminRoutes      from "./Routes/adminRoutes.js";
import uploadRoutes     from "./Routes/uploadRoutes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import internshipRoutes from "./Routes/internshipRoutes.js";
import { maintenanceGuard } from "./middleware/maintenance.js";

connectDB();

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:5001",
    "http://localhost:5001",
  ],
  credentials:    true,
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Disable rate limiter during tests ──
if (process.env.NODE_ENV !== "test") {
  app.use(globalLimiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ──
app.use("/api/auth", authRoutes);
app.use("/api", maintenanceGuard);

app.use("/api/students",    studentRoutes);
app.use("/api/groups",      groupRoutes);
app.use("/api/marks",       marksRoutes);
app.use("/api/deadlines",   deadlineRoutes);
app.use("/api/supervisors", supervisorRoutes);
app.use("/api/supervisor",  supervisorRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/uploads",     uploadRoutes);
app.use("/api/internship",  internshipRoutes);

app.get("/", (req, res) => {
  res.json({ message: "FYP Management System API is running" });
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error("\n── SERVER ERROR ──");
  console.error("URL    :", req.method, req.url);
  console.error("Message:", err.message);
  console.error("Stack  :", err.stack);
  console.error("──────────────────\n");
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
    name:    err.name,
    code:    err.code,
  });
});

// ── START SERVER — only when run directly, not when imported by tests ──
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === __filename
) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;