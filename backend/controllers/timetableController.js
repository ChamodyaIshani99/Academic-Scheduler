const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const StudentGroup = require("../models/StudentGroup");
const Lecturer = require("../models/Lecturer");

const hasConflict = require("../utils/conflictChecker"); // advanced version
const isOverlapping = require("../utils/timeValidator");

// normal scheduler (optional)
const { generateTimetable } = require("../services/schedulerService");

// AI scheduler ⭐
const runGA = require("../services/geneticScheduler");


// ==============================
// 🟢 CREATE (Manual Insert)
// ==============================
exports.createTimetable = async (req, res) => {
  try {
    const {
      groupId,
      subjectId,
      lecturerId,
      roomId,
      day,
      startTime,
      endTime
    } = req.body;

    // ✅ basic validation
    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        message: "Day and time required"
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // ✅ conflict check
    const conflict = await hasConflict(
      groupId,
      lecturerId,
      roomId,
      day,
      startTime,
      endTime
    );

    if (conflict) {
      return res.status(400).json({
        message: "Time conflict detected"
      });
    }

    const entry = await Timetable.create(req.body);

    res.json(entry);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 🔵 READ ALL
// ==============================
exports.getAllTimetable = async (req, res) => {
  try {
    const data = await Timetable.find()
      .populate("groupId")
      .populate("subjectId")
      .populate("lecturerId")
      .populate("roomId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 🟡 UPDATE
// ==============================
exports.updateTimetable = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;

    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({
        message: "Invalid time range"
      });
    }

    const existing = await Timetable.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    // check conflict (excluding current record)
    const schedules = await Timetable.find({
      _id: { $ne: req.params.id },
      day: day || existing.day
    });

    for (let s of schedules) {
      const overlap = isOverlapping(
        startTime || existing.startTime,
        endTime || existing.endTime,
        s.startTime,
        s.endTime
      );

      if (overlap) {
        if (
          s.groupId.equals(req.body.groupId || existing.groupId) ||
          s.lecturerId.equals(req.body.lecturerId || existing.lecturerId) ||
          s.roomId.equals(req.body.roomId || existing.roomId)
        ) {
          return res.status(400).json({
            message: "Conflict during update"
          });
        }
      }
    }

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 🔴 DELETE ONE
// ==============================
exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 🧹 DELETE ALL
// ==============================
exports.deleteAllTimetable = async (req, res) => {
  try {
    await Timetable.deleteMany();
    res.json({ message: "All timetable cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// ⚙️ NORMAL GENERATOR
// ==============================
exports.generate = async (req, res) => {
  try {
    await generateTimetable();

    res.json({
      message: "Timetable Generated (Basic Algorithm)"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 🤖 AI GENERATOR (GENETIC ALGORITHM) ⭐
// ==============================
exports.generateAI = async (req, res) => {
  try {
    const subjects = await Subject.find();
    const rooms = await Room.find();
    const groups = await StudentGroup.find();

    const bestTimetable = runGA(subjects, rooms, groups);

    await Timetable.deleteMany();
    await Timetable.insertMany(bestTimetable);

    res.json({
      message: "AI Timetable Generated Successfully",
      note: "Optimized using Genetic Algorithm"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 📊 REPORT: Lecturer Schedule
// ==============================
exports.getLecturerSchedule = async (req, res) => {
  try {
    const data = await Timetable.find({
      lecturerId: req.params.id
    }).populate("subjectId roomId groupId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 📊 REPORT: Room Usage
// ==============================
exports.getRoomSchedule = async (req, res) => {
  try {
    const data = await Timetable.find({
      roomId: req.params.id
    }).populate("subjectId lecturerId groupId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ==============================
// 📊 REPORT: Student Group
// ==============================
exports.getGroupSchedule = async (req, res) => {
  try {
    const data = await Timetable.find({
      groupId: req.params.id
    }).populate("subjectId lecturerId roomId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};