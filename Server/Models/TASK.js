import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

  title: String,
  description: String,

  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending"
  },

  deadline: Date,

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Task", taskSchema);