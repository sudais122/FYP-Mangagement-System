import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  message: String,
  is_read: { type: Boolean, default: false },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Notification", notificationSchema);