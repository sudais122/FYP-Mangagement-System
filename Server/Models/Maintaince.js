import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({

  // ── Mark access toggles ──
  toggles: {
    type:    Object,
    default: {},
  },

  // ── Maintenance Mode ──
  maintenance_mode: {
    type:    Boolean,
    default: false,
  },
  maintenance_reason: {
    type:    String,
    default: "We're upgrading the system. Please check back shortly.",
  },
  maintenance_started_at: {
    type:    Date,
    default: null,
  },
  maintenance_enabled_by: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     "Admin",
    default: null,
  },

  // ── Chairman Analytics Mode ──
  chairman_monitoring_mode: {
    type:    Boolean,
    default: false,
  },
  chairman_mode_enabled_at: {
    type:    Date,
    default: null,
  },
  chairman_mode_enabled_by: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     "Admin",
    default: null,
  },

}, { timestamps: true });

export default mongoose.model("Maintaince", settingsSchema);