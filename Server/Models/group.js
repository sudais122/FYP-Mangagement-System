import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  team_code: {
    type: String,
    unique: true,
    required: true,    // ← now required, must come from generateTeamId
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
  // proposal fields (kept for upload flow)
  proposal_url:        { type: String },
  proposal_public_id:  { type: String },
  proposal_filename:   { type: String },
  proposal_uploaded_by:{ type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  proposal_uploaded_at:{ type: Date },
  proposal_status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;