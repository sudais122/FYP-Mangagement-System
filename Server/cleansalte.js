import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import Supervisor from "./Models/supervisor.js";
import Group from "./Models/group.js";
import Marks from "./Models/marks.js";
import Counter from "./Models/counter.js";

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected\n");

// ───DELETE ONLY SUPERVISORS─────────────

const supervisorsDeleted = await Supervisor.deleteMany({});
console.log(`🧹 Deleted ${supervisorsDeleted.deletedCount} supervisors`);

const groupsDeleted = await Group.deleteMany({});
console.log(`🧹 Deleted ${groupsDeleted.deletedCount} teams`);

const marksDeleted = await Marks.deleteMany({});
console.log(`🧹 Deleted ${marksDeleted.deletedCount} marks records`);


// ─── RESET ONLY SUPERVISOR + TEAM COUNTERS ─────────────

await Counter.findOneAndUpdate(
  { name: "supervisor" },
  { value: 0 },
  { upsert: true }
);

await Counter.findOneAndUpdate(
  { name: "team" },
  { value: 0 },
  { upsert: true }
);

console.log(`\n Supervisor and Team counters reset`);

const year = new Date().getFullYear();

console.log(`\nNext IDs will be:`);

console.log(`   Supervisor → SUP-${year}0001`);
console.log(`   Team       → TEAM-${year}0001`);

console.log("\nCleanup complete!");

process.exit(0);