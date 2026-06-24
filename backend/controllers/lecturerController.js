const Lecturer = require("../models/Lecturer");

// CREATE
exports.createLecturer = async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      availability
    } = req.body;

    // ✅ Required validation
    if (!name || !email || !department) {
      return res.status(400).json({
        message: "Name, Email, and Department are required"
      });
    }

    // ✅ Check duplicate email
    const exists = await Lecturer.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // ✅ Validate availability time
    if (availability && availability.length > 0) {
      for (let slot of availability) {
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({
            message: "Invalid time range in availability"
          });
        }
      }
    }

    const lecturer = await Lecturer.create(req.body);

    res.status(201).json(lecturer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// READ ALL
exports.getLecturers = async (req, res) => {
  try {
    const data = await Lecturer.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// READ ONE (NEW ⭐)
exports.getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findById(req.params.id);

    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.json(lecturer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE
exports.updateLecturer = async (req, res) => {
  try {
    const updated = await Lecturer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE
exports.deleteLecturer = async (req, res) => {
  try {
    const deleted = await Lecturer.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};