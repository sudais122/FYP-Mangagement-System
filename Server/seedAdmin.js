import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Admin from "./Models/admin.js";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Admin.create({
    name: "Aftab Ahmed Khan",
    email: "aftab.ahmed.khan@awkum.edu.pk",
    password: "aftabakhan",
  });
  console.log("Admin created ");
  process.exit();
}).catch(err => {
  console.log(err);
  process.exit(1);
});