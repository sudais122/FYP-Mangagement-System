import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema({
  student_code: {
    type: String,
    unique: true,
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
  whatsapp: {
    type: String,
    required: [true, "WhatsApp number is required"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{11}$/.test(v);
      },
      message: "WhatsApp number must be exactly 11 digits with no spaces or dashes",
    },
  },
  roll_number: {
    type: String,
    trim: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
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