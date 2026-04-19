import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, unique: true, required: true },
    password:     { type: String, required: true },
    cv:           { type: String, required: true },
    student_code: { type: String, unique: true, sparse: true },
    resetOtp:       { type: String, default: null },
    resetOtpExpire: { type: Date,   default: null },
    isOtpVerified:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);