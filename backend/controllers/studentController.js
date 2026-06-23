const Student = require("../models/Student");

// CREATE STUDENT (Admin only)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, regNo, department, year } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const student = await Student.create({
      name,
      email: email?.toLowerCase() || undefined,
      regNo,
      department,
      year,
      groupId: null
    });

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ ALL STUDENTS
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("groupId");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET STUDENT BY ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("groupId");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STUDENT (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, regNo, department, year } = req.body;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email: email?.toLowerCase() || undefined, regNo, department, year },
      { new: true }
    ).populate("groupId");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE STUDENT (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student?.groupId) {
      // Remove from group
      const StudentGroup = require("../models/StudentGroup");
      await StudentGroup.findByIdAndUpdate(student.groupId, {
        $pull: { students: student._id }
      });
    }
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};