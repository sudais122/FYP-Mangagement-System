import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supervisor",
  },
  file_url: {
    type: String,
    required: true,
  },
  file_public_id: {
    type: String, // for Cloudinary deletion
  },
  original_filename: String,
  file_size: Number,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejection_reason: {
    type: String,
    default: "",
  },
  version: {
    type: Number,
    default: 1, // increments on re-upload
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
});

const Proposal = mongoose.model("Proposal", proposalSchema);
export default Proposal;