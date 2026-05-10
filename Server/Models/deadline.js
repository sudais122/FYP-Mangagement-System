import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Proposal Submission",
        "SRS Submission",
        "Documentation",
        "Presentation",
        "Final Report",
        "Other",
      ],
      required: true,
    },
    customName: { type: String, default: "" },
    description: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

export default mongoose.model("Deadline", deadlineSchema);
