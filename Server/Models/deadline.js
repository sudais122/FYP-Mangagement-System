import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    deadlineType: {
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

    customDeadlineName: {
      type: String,
      trim: true,

      required: function () {
        return this.deadlineType === "Other";
      },
    },

    description: {
      type: String,
      default: "",
    },

    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Deadline", deadlineSchema);