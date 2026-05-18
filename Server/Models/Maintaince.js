import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  toggles: {
    type: Object,
    default: {},
  },
  maintenance_mode: {
    type: Boolean,
    default: false,
  },
  maintenance_reason: {
    type: String,
    default: "We're upgrading the system. Please check back shortly.",
  },
  maintenance_started_at: {
    type: Date,
    default: null,
  },
  maintenance_enabled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("Maintaince", settingsSchema);