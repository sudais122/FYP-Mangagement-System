import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema({
  student_code: {
    type: String,
    unique: true,
    // e.g. STD-20264731
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  roll_number: {
    type: String,
    unique: true,
  },
  batch: {
    type: String, // e.g. "2022-2026"
  },
  department: {
    type: String,
    default: "Computer Science",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  role: {
    type: String,
    default: "student",
  },
  team_role: {
    type: String,
    enum: ["Leader", "Member"],
    default: "Member",
  },
  coursera_completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate student_code before saving
studentSchema.pre("save", async function (next) {
  // Hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // Generate student code if not set
  if (!this.student_code) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.student_code = `STD-${year}${rand}`;
  }
  next();
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);
export default Student;