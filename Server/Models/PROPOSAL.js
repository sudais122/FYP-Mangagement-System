import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  proposal_code: String,
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

  title: String,
  description: String,
  pdf_path: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "revision"],
    default: "pending"
  },

  submission_date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Proposal", proposalSchema);
