import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  type:    { type: String, required: true, unique: true },
  toggles: { type: Object, default: {} }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;