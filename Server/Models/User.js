// ════════════════════════════════════════════════════════════
//  models/Student.js  —  MongoDB schema
// ════════════════════════════════════════════════════════════
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentID: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password: {
      type:     String,
      required: true,
      minlength: 8,
    },
    cv: {
      url:      { type: String, required: true },   
      publicId: { type: String, required: true },   
      fileName: String,
      size:     Number,
    },
    role: {
      type:    String,
      enum:    ['student'],
      default: 'student',
    },
    teamID: {
      type:    String,
      default: null,
    },
  },
  { timestamps: true } 
);

studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);