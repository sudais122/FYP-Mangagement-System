import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    full_name: {
      type:     String,
      required: [true, "Full name is required"],
      trim:     true,
    },

    cnic: {
      type:      String,
      required:  [true, "CNIC is required"],
      trim:      true,
      minlength: [13, "CNIC must be 13 digits"],
      maxlength: [13, "CNIC must be 13 digits"],
      match:     [/^\d{13}$/, "CNIC must contain exactly 13 digits without dashes"],
    },

    discipline: {
      type:     String,
      required: [true, "Discipline is required"],
      enum:     [
        "BS Computer Science (Hons)",
        "Software",
        "Artificial Intelligence",
        "Cyber Security",
      ],
    },

    acceptance_letter_url: {
      type:    String,
      default: null,
    },

    acceptance_letter_filename: {
      type:    String,
      default: null,
    },

    acceptance_letter_uploaded_at: {
      type:    Date,
      default: null,
    },

    student: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Student",
      default: null,
    },

    batch: {
      type:    String,
      default: () => {
        const now   = new Date();
        const year  = now.getFullYear();
        const month = now.getMonth() + 1;
        return month >= 9
          ? `${year}-${String(year + 1).slice(2)}`
          : `${year - 1}-${String(year).slice(2)}`;
      },
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────
internshipSchema.index({ batch: 1, discipline: 1 });   // ← NEW
internshipSchema.index({ cnic: 1 });
internshipSchema.index({ student: 1 });

export default mongoose.model("Internship", internshipSchema);