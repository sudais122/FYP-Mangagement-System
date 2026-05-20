import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    full_name:  {
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
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Student",
      default:  null,
    },
  },
  {
    timestamps: true,  
  }
);

export default mongoose.model("Internship", internshipSchema);