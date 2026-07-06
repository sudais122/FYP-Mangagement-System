// Models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    type:    { type: String, required: true, unique: true },
    toggles: { type: Map, of: Boolean, default: {} }, 
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);