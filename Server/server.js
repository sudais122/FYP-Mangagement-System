import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from 'bcryptjs';

import connectDB from "./config/db.js";
import authRoutes from "./Routes/authRoutes.js";
import User from "./Models/User.js"
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});