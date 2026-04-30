import mongoose from "mongoose";
import bcrypt from "bcrypt";

const supervisorSchema = new mongoose.Schema({
  sup_code: {
    type: String,
    unique: true,
    // e.g. SUP-20260001
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: "Computer Science",
  },
  designation: {
    type: String, // e.g. "Associate Professor"
  },
  research_areas: [String],
  office: String,
  office_hours: String,
  max_groups: {
    type: Number,
    default: 5,
  },
  role: {
    type: String,
    default: "supervisor",
  },
  force_password_change: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

supervisorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.sup_code) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Supervisor").countDocuments();
    const seq = String(count + 1).padStart(4, "0");
    this.sup_code = `SUP-${year}${seq}`;
  }
  next();
});

supervisorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);
export default Supervisor;