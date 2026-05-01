import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
console.log("MONGO:", process.env.MONGO_URI);
// Routes
import authRoutes from "./Routes/authRoutes.js";
import studentRoutes from "./Routes/studentRoutes.js";
import groupRoutes from "./Routes/groupRoutes.js";
import marksRoutes from "./Routes/marksRoutes.js";
import proposalRoutes from "./Routes/proposalRoutes.js";
import fileRoutes from "./Routes/fileRoutes.js";
import supervisorRoutes from "./Routes/supervisorRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/supervisors", supervisorRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FYP Management System API is running ✅" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
