import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    team_code: {
      type: String,
      unique: true,
      required: true, // ← now required, must come from generateTeamId
    },

    project_title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Artificial Intelligence",
        "Web Development",
        "Mobile Application",
        "Data Science",
        "Cybersecurity",
        "Embedded Systems",
        "Networking",
        "Other",
      ],
      default: "Other",
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed"],
      default: "Active",
    },

    academic_year: {
      type: String,
    },

    // ── PROPOSAL FIELDS ──────────────────────────────────────

    proposal_url: {
      type: String,
      default: null,
    },

    proposal_public_id: {
      type: String,
      default: null,
    },

    proposal_filename: {
      type: String,
      default: null,
    },

    proposal_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
    },

    proposal_uploaded_at: {
      type: Date,
      default: null,
    },

    proposal_uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },

    proposal_rejection_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;