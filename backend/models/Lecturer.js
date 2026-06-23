const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: String,
  availability: [
  {
    day: String,
    startTime: String,
    endTime: String
  }
]
});

module.exports = mongoose.model("Lecturer", lecturerSchema);