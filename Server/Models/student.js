import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema(
  {
    student_code: {
      type:     String,
      unique:   true,
      required: true,
    },

    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      index:    true,
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    password: {
      type:      String,
      required:  true,
      minlength: 6,
    },

    gender: {
      type:     String,
      enum:     ["male", "female"],
      required: true,
      index:    true,
    },

    whatsapp: {
      type:     String,
      required: [true, "WhatsApp number is required"],
      trim:     true,
    },

    roll_number: {
      type:  String,
      trim:  true,
      index: true,
    },

    group: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Group",
      default: null,
      index:   true,
    },

    role: {
      type:    String,
      default: "student",
      index:   true,
    },

    team_role: {
      type:    String,
      enum:    ["Leader", "Member"],
      default: "Member",
      index:   true,
    },

    avatar_url: {
      type:    String,
      default: null,
    },

    cv_url: {
      type:    String,
      default: null,
    },

    cv_public_id: {
      type:    String,
      default: null,
    },

    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date   },
  },
  {
    timestamps: true,
  }
);


studentSchema.index({ group: 1, team_role: 1 });

studentSchema.index({ group: 1, gender: 1 });

studentSchema.index(
  { resetPasswordToken: 1 },
  { sparse: true }
);

studentSchema.index({ name: "text" });

studentSchema.pre("save", async function (next) {
  if (this.isModified("password") && !this.password.startsWith("$2")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);

export default Student;