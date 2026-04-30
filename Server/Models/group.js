import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  team_code: {
    type: String,
    unique: true,
    // e.g. TEAM-20268372
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
    type: String, // e.g. "2025-2026"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

groupSchema.pre("save", async function (next) {
  if (!this.team_code) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.team_code = `TEAM-${year}${rand}`;
  }
  next();
});

const Group = mongoose.model("Group", groupSchema);
export default Group;