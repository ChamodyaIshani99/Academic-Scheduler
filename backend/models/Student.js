const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  regNo: { type: String, unique: true, sparse: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentGroup", default: null },
  department: String,
  year: Number
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
