// Token blacklist for logout (optional but good practice)
import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // auto-delete after 7 days
  },
});

const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
export default TokenBlacklist;