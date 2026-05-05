import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supervisor",
    required: true,
  },
  // Monthly Meetings (10 each = 50 total)
  monthly: {
    oct:  { type: Number, default: null, min: 0, max: 10 },
    nov:  { type: Number, default: null, min: 0, max: 10 },
    dec:  { type: Number, default: null, min: 0, max: 10 },
    feb:  { type: Number, default: null, min: 0, max: 10 },
    mar:  { type: Number, default: null, min: 0, max: 10 },
  },
  submissions: {
    proposal: { type: Number, default: null, min: 0, max: 10 },
    progress:  { type: Number, default: null, min: 0, max: 20 },
  },
  viva: {
    internal1: { type: Number, default: null, min: 0, max: 25 },
    internal2: { type: Number, default: null, min: 0, max: 25 },
    external:  { type: Number, default: null, min: 0, max: 50 },
  },
  documentation: {
    final: { type: Number, default: null, min: 0, max: 20 },
  },
  total: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-calculate total before save
marksSchema.pre("save", function (next) {
  let total = 0;
  const m = this.monthly;
  const s = this.submissions;
  const v = this.viva;
  const d = this.documentation;
  if (m.oct  != null) total += m.oct;
  if (m.nov  != null) total += m.nov;
  if (m.dec  != null) total += m.dec;
  if (m.feb  != null) total += m.feb;
  if (m.mar  != null) total += m.mar;
  if (s.proposal != null) total += s.proposal;
  if (s.progress  != null) total += s.progress;
  if (v.internal1 != null) total += v.internal1;
  if (v.internal2 != null) total += v.internal2;
  if (v.external  != null) total += v.external;
  if (d.final     != null) total += d.final;
  this.total = total;
  this.updatedAt = new Date();
  next();
});

const Marks = mongoose.model("Marks", marksSchema);
export default Marks;