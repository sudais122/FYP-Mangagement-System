import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: String,
  email: { type: String, unique: true },
  password: String,

  student_code: { type: String, unique: true },
  reg_no: { type: String, unique: true },

  role: {
    type: String,
    default: "student"
  },

  cvUrl: String,
  cvPublicId: String,

  account_status: {
    type: String,
    default: "active"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);