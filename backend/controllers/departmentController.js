const Department = require("../models/Department");

// CREATE (Admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dep = await Department.create({ name });

    res.status(201).json(dep);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// READ ALL
exports.getDepartments = async (req, res) => {
  try {
    const data = await Department.find().sort({ name: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE ⭐ (NEW)
exports.updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE
exports.deleteDepartment = async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};