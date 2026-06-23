const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentGroup" },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer" },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

  day: String,
  startTime: String,
  endTime: String
});

module.exports = mongoose.model("Timetable", timetableSchema);