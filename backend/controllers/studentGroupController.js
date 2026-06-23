const StudentGroup = require("../models/StudentGroup");
const Student = require("../models/Student");

// CREATE GROUP (Admin only)
exports.createGroup = async (req, res) => {
  try {
    const { groupName, groupId, description, department, year, maxSize } = req.body;

    if (!groupName || !groupId) {
      return res.status(400).json({ message: "Group name and ID required" });
    }

    const exists = await StudentGroup.findOne({ groupId });
    if (exists) {
      return res.status(400).json({ message: "Group ID already exists" });
    }

    const group = await StudentGroup.create({
      groupName,
      groupId,
      description,
      department,
      year,
      maxSize: maxSize || 0,
      students: []
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL GROUPS with populated students
exports.getGroups = async (req, res) => {
  try {
    const groups = await StudentGroup.find().populate("students");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET GROUP BY ID with students
exports.getGroupById = async (req, res) => {
  try {
    const group = await StudentGroup.findById(req.params.id).populate("students");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE GROUP (Admin only)
exports.updateGroup = async (req, res) => {
  try {
    const { groupName, description, department, year, maxSize } = req.body;
    const updated = await StudentGroup.findByIdAndUpdate(
      req.params.id,
      { groupName, description, department, year, maxSize },
      { new: true }
    ).populate("students");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE GROUP (Admin only)
exports.deleteGroup = async (req, res) => {
  try {
    // Remove students from group
    await Student.updateMany({ groupId: req.params.id }, { groupId: null });
    // Delete group
    await StudentGroup.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD STUDENT TO GROUP
exports.addStudentToGroup = async (req, res) => {
  try {
    const { studentId } = req.body;
    const groupId = req.params.id;

    const group = await StudentGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove student from previous group if any
    if (student.groupId) {
      await StudentGroup.findByIdAndUpdate(student.groupId, {
        $pull: { students: studentId }
      });
    }

    // Add to new group
    if (!group.students.includes(studentId)) {
      await StudentGroup.findByIdAndUpdate(groupId, {
        $addToSet: { students: studentId }
      });
    }

    student.groupId = groupId;
    await student.save();

    const updated = await StudentGroup.findById(groupId).populate("students");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE STUDENT FROM GROUP
exports.removeStudentFromGroup = async (req, res) => {
  try {
    const { studentId } = req.body;
    const groupId = req.params.id;

    const group = await StudentGroup.findByIdAndUpdate(
      groupId,
      { $pull: { students: studentId } },
      { new: true }
    ).populate("students");

    await Student.findByIdAndUpdate(studentId, { groupId: null });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
