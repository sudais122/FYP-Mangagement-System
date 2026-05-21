import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import Student from "./Models/student.js";
import Supervisor from "./Models/supervisor.js";
import Counter from "./Models/counter.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

// ─── STUDENT counter ─────────────────────────────────
const students = await Student.find().select("student_code");
let maxStudent = 0;
students.forEach(s => {
  const num = parseInt(s.student_code?.slice(-4)) || 0;
  if (num > maxStudent) maxStudent = num;
});
await Counter.findOneAndUpdate(
  { name: "student" },
  { value: maxStudent },
  { upsert: true }
);
console.log(`Student counter set to ${maxStudent} → next ID: STD-${new Date().getFullYear()}${String(maxStudent + 1).padStart(4, "0")}`);

// ─── SUPERVISOR counter ──────────────────────────────
const sups = await Supervisor.find().select("sup_code");
let maxSup = 0;
sups.forEach(s => {
  const num = parseInt(s.sup_code?.slice(-5)) || 0;
  if (num > maxSup) maxSup = num;
});
await Counter.findOneAndUpdate(
  { name: "supervisor" },
  { value: maxSup },
  { upsert: true }
);
console.log(`Supervisor counter set to ${maxSup} → next ID: SUP-2026${String(maxSup + 1).padStart(5, "0")}`);

console.log("\n Done! You can delete this seedCounter.js file now.");
process.exit(0);