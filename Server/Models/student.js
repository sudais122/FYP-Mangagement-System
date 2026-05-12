import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema(
  {
    student_code: {
      type: String,
      unique: true,
      required: true, 
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
        message:
          "WhatsApp number must be exactly 11 digits with no spaces or dashes",
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

    cv_url: {
      type: String,
      default: null,
    },

    cv_public_id: {
      type: String,
      default: null,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ── PASSWORD HASHING (only if not already hashed) ─────────────
studentSchema.pre("save", async function (next) {
  // Only hash if password was modified AND it's not already hashed
  // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars long
  if (this.isModified("password") && !this.password.startsWith("$2")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// ── MATCH PASSWORD ────────────────────────────────────────────
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model("Student", studentSchema);

export default Student;