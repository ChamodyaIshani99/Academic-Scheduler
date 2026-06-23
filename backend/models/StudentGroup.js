const mongoose = require("mongoose");

const studentGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupId: { type: String, required: true, unique: true },
  description: String,
  department: String,
  year: Number,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  maxSize: { type: Number, default: 0 }
}, { timestamps: true });

// Virtual for calculated group size
studentGroupSchema.virtual('size').get(function() {
  return this.students ? this.students.length : 0;
});

module.exports = mongoose.model("StudentGroup", studentGroupSchema);