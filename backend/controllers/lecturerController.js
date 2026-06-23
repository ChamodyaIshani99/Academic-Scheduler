const Lecturer = require("../models/Lecturer");

// CREATE
exports.createLecturer = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const lecturer = await Lecturer.create(req.body);
    res.json(lecturer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ
exports.getLecturers = async (req, res) => {
  const data = await Lecturer.find();
  res.json(data);
};

// UPDATE
exports.updateLecturer = async (req, res) => {
  const updated = await Lecturer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
exports.deleteLecturer = async (req, res) => {
  await Lecturer.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};