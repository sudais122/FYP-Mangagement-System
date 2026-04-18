import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["student", "supervisor", "admin"],
    required: true
  },

  student_code: String,
  supervisor_code: String,
  admin_code: String,

  cv_path: String,
  discipline: String,
  max_teams: { type: Number, default: 3 },

  account_status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);