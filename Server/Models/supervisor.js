import mongoose from "mongoose";
import bcrypt from "bcrypt";

const supervisorSchema = new mongoose.Schema({
  sup_code: {
    type:     String,
    unique:   true,   
    required: true,
  },

  name: {
    type:     String,
    required: true,
    trim:     true,
    index:    true,  
  },

  prefix: {
    type:     String,
    enum:     ["Mr", "Ms", "Mrs", "Dr", "Prof", "Lect", "Engr"],
    default:  "Mr",
    required: true,
    index:    true,   
  },

  email: {
    type:      String,
    required:  true,
    unique:    true, 
    lowercase: true,
    trim:      true,
  },

  password: {
    type:     String,
    required: true,
  },

  whatsapp: {
    type:    String,
    default: "",
    trim:    true,
  },

  department: {
    type:    String,
    default: "Computer Science",
    index:   true,  
  },

  designation: {
    type:    String,
    default: "Supervisor",
    index:   true,  
  },

  office: {
    type:    String,
    default: "",
    trim:    true,
  },

  office_hours: {
    type:    String,
    default: "",
    trim:    true,
  },

  research_areas: [
    {
      type: String,
      trim: true,
    },
  ],

  max_groups: {
    type:    Number,
    default: 5,
  },

  is_chairman: {
    type:    Boolean,
    default: false,
    index:   true,   
  },

  role: {
    type:    String,
    enum:    ["supervisor", "chairman"],
    default: "supervisor",
    index:   true,   
  },

  force_password_change: {
    type:    Boolean,
    default: true,
  },

  avatar_url: {
    type:    String,
    default: null,
  },

  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date   },

  createdAt: {
    type:    Date,
    default: Date.now,
    index:   true,   
  },
},
{
  timestamps: true,
});

supervisorSchema.index({ department: 1, name: 1 });

supervisorSchema.index({ role: 1, is_chairman: 1 });

supervisorSchema.index(
  { resetPasswordToken: 1 },
  { sparse: true }           
);

supervisorSchema.index({ name: "text" });

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