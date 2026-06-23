const Subject = require("../models/Subject");

// CREATE
exports.createSubject = async (req, res) => {
  try {
    const { name, hoursPerWeek } = req.body;

    if (!name || hoursPerWeek <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const subject = await Subject.create(req.body);
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ
exports.getSubjects = async (req, res) => {
  const data = await Subject.find().populate("lecturerId");
  res.json(data);
};

// UPDATE
exports.updateSubject = async (req, res) => {
  const updated = await Subject.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
exports.deleteSubject = async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};