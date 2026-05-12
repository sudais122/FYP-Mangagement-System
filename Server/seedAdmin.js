import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import mongoose from "mongoose";
import Admin from "./Models/admin.js";

mongoose.connect(process.env.MONGO_URI).then(async () => {

  await Admin.deleteMany({});
  console.log("old admins deleted");

  const admin = new Admin({
    name:     process.env.ADMIN_NAME,
    email:    process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role:     "admin"
  });

  await admin.save();

  console.log("Admin created:", process.env.ADMIN_EMAIL);
  process.exit();

}).catch(err => {
  console.log("Error:", err);
  process.exit(1);
});