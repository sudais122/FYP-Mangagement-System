import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  file_path: String,
  repo_link: String,
  version: Number,

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("TaskSubmission", submissionSchema);