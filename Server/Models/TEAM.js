import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  team_code: String,
  project_title: String,

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Team", teamSchema);