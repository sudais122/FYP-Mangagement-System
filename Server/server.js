import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes       from "./Routes/authRoutes.js"; 
import studentRoutes    from "./Routes/studentRoutes.js";
import groupRoutes      from "./Routes/groupRoutes.js";
import marksRoutes      from "./Routes/marksRoutes.js";
import deadlineRoutes   from "./Routes/deadlineRoutes.js";
import supervisorRoutes from "./Routes/supervisorRoutes.js";
import adminRoutes      from "./Routes/adminRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5501", "http://localhost:5501"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",        authRoutes);
app.use("/api/students",    studentRoutes);
app.use("/api/groups",      groupRoutes);
app.use("/api/marks",       marksRoutes);
app.use("/api/deadlines", deadlineRoutes);
// app.use("/api/proposals",   proposalRoutes);
// app.use("/api/files",       fileRoutes);
app.use("/api/supervisors", supervisorRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/supervisor",  supervisorRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.json({ message: "FYP Management System API is running" });
});

app.use((err, req, res, next) => {
  console.error("\nSERVER ERROR");
  console.error("URL:", req.method, req.url);
  console.error("Message:", err.message);
  console.error("Name:", err.name);
  console.error("Code:", err.code);
  console.error("Full stack:", err.stack);
  console.error("END ERROR\n");
  res.status(500).json({ 
    message: err.message || "Server Error",
    name: err.name,
    code: err.code
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});