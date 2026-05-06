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

  // Monthly Meetings — 10 each, 50 total
  monthly: {
    oct: { type: Number, default: null, min: 0, max: 10 },
    nov: { type: Number, default: null, min: 0, max: 10 },
    dec: { type: Number, default: null, min: 0, max: 10 },
    feb: { type: Number, default: null, min: 0, max: 10 },
    mar: { type: Number, default: null, min: 0, max: 10 },
  },

  // Submissions — Proposal + Progress + Code + Similarity checks
  submissions: {
    proposal:   { type: Number, default: null, min: 0, max: 10 },
    progress:   { type: Number, default: null, min: 0, max: 20 },
    code:       { type: Number, default: null, min: 0, max: 10 },
    prog_sim:   { type: Number, default: null, min: 0, max: 5  },
    thesis_sim: { type: Number, default: null, min: 0, max: 5  },
  },

  // Viva — Internal 1, Internal 2, External
  viva: {
    internal1: { type: Number, default: null, min: 0, max: 25 },
    internal2: { type: Number, default: null, min: 0, max: 25 },
    external:  { type: Number, default: null, min: 0, max: 30 },
  },

  // Documentation — Final thesis/report
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

  const m = this.monthly || {};
  ["oct", "nov", "dec", "feb", "mar"].forEach(k => {
    if (m[k] != null) total += m[k];
  });

  const s = this.submissions || {};
  ["proposal", "progress", "code", "prog_sim", "thesis_sim"].forEach(k => {
    if (s[k] != null) total += s[k];
  });

  const v = this.viva || {};
  ["internal1", "internal2", "external"].forEach(k => {
    if (v[k] != null) total += v[k];
  });

  const d = this.documentation || {};
  if (d.final != null) total += d.final;

  this.total = total;
  this.updatedAt = new Date();
  next();
});

const Marks = mongoose.model("Marks", marksSchema);
export default Marks;