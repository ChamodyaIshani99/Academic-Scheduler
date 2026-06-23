const Timetable = require("../models/Timetable");

exports.lecturerReport = async (req, res) => {
  const data = await Timetable.find().populate("lecturerId");

  res.json(data);
};

exports.roomReport = async (req, res) => {
  const data = await Timetable.find().populate("roomId");

  res.json(data);
};