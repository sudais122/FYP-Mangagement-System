import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Admin from "./Models/admin.js";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Delete existing admin first
  await Admin.deleteOne({ email: "aftab.ahmed.khan@awkum.edu.pk" });
  
  // Create new admin - the password will be auto-hashed by the model
  const admin = new Admin({
    name: "Aftab Ahmed Khan",
    email: "awkum.fyp.team@gmail.com",
    password: "aftabakhan",
    role: "admin" 
  });
  
  await admin.save();
  
  console.log("Admin created successfully!");
  process.exit();
}).catch(err => {
  console.log("Error:", err);
  process.exit(1);
});