const mongoose = require("mongoose");

const lecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    unique: true,
    required: true
  },

  phone: String,

  department: {
    type: String,
    required: true
  },

  specialization: String,

  subjects: [
    {
      name: String
    }
  ],

  availability: [
    {
      day: String,
      startTime: String,
      endTime: String
    }
  ],

  preferredDays: [String], // ["Mon", "Tue"]

preferredTimes: [
  {
    start: String,
    end: String
  }
],

}, { timestamps: true });

module.exports = mongoose.model("Lecturer", lecturerSchema);