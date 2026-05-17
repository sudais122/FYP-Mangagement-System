import mongoose from "mongoose";

const proposalHistorySchema = new mongoose.Schema(
  {
    attempt:          { type: Number,  required: true },
    proposal_url:     { type: String,  default: null },
    filename:         { type: String,  default: null },
    uploaded_at:      { type: Date,    default: null },
    rejected_at:      { type: Date,    default: null },
    rejection_reason: { type: String,  default: null },
    file_deleted:     { type: Boolean, default: false },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    team_code: {
      type:     String,
      unique:   true,  
      required: true,
    },

    project_title: {
      type:     String,
      required: [true, "Project title is required"],
      trim:     true,
      index:    true,  
    },

    category: {
      type: String,
      enum: [
        "Artificial Intelligence",
        "Web Development",
        "Mobile Application",
        "Data Science",
        "Cybersecurity",
        "Embedded Systems",
        "Networking",
        "Other",
      ],
      default: "Other",
      index:   true,    
    },

    leader: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Student",
      required: true,
      index:    true,   
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Student",
      },
    ],

    supervisor: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Supervisor",
      default: null,
      index:   true,   
    },

    status: {
      type:    String,
      enum:    ["Active", "Inactive", "Completed"],
      default: "Active",
      index:   true,    
    },

    academic_year: {
      type:  String,
      index: true,  
    },

    proposal_url:      { type: String,  default: null },
    proposal_filename: { type: String,  default: null },

    proposal_status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: null,
      index:   true,   
    },

    proposal_uploaded_by: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Student",
      default: null,
      index:   true,   
    },

    proposal_uploaded_at:      { type: Date,    default: null },
    proposal_attempt:          { type: Number,  default: 1 },
    proposal_rejected_at:      { type: Date,    default: null },
    proposal_rejection_reason: { type: String,  default: null },
    proposal_file_deleted:     { type: Boolean, default: false },

    proposal_history: [proposalHistorySchema],
  },
  {
    timestamps: true,  
  }
);

groupSchema.index({ supervisor: 1, status: 1 });

groupSchema.index({ proposal_status: 1, academic_year: 1 });

groupSchema.index({ academic_year: 1, status: 1 });

groupSchema.index({ members: 1 });

groupSchema.index({ project_title: "text" });

const Group = mongoose.model("Group", groupSchema);

export default Group;