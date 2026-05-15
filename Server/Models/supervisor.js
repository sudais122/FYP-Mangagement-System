import mongoose from "mongoose";
import bcrypt from "bcrypt";

const supervisorSchema = new mongoose.Schema({
  sup_code: {
    type: String,
    unique: true,
    required: true,
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

  whatsapp: {
    type: String,
    required: false,
    default: "",
    trim: true,
    match: [/^03\d{9}$/, "Please use valid Pakistani number"],
  },

  department: {
    type: String,
    default: "Computer Science",
  },

  designation: {
    type: String,
    default: "Lecturer",
  },

  office: {
    type: String,
    default: "",
    trim: true,
  },

  office_hours: {
    type: String,
    default: "",
    trim: true,
  },

  research_areas: [{
    type: String,
    trim: true,
  }],

  max_groups: {
    type: Number,
    default: 5,
  },

  is_chairman: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ["supervisor", "chairman"],
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

  resetPasswordToken: {
    type: String,
  },

  resetPasswordExpire: {
    type: Date,
  },
  prefix: {
  type: String,
  enum: ["Mr", "Ms", "Mrs", "Dr", "Prof", "Lect", "Engr"],
  default: "Mr",
  required: true
}
});

supervisorSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

supervisorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Supervisor = mongoose.model("Supervisor", supervisorSchema);

export default Supervisor;