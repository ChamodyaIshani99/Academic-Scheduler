const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
  hoursPerWeek: Number
});

module.exports = mongoose.model("Subject", subjectSchema);