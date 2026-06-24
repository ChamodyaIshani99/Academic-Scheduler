const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const StudentGroup = require("../models/StudentGroup");
const Lecturer = require("../models/Lecturer");

const hasConflict = require("../utils/conflictChecker"); // advanced version
const isOverlapping = require("../utils/timeValidator");
const calculateFitness = require("../utils/fitnessCalculator");

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
    const subjects = await Subject.find().populate("lecturerId");
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

exports.getTimetableScore = async (req, res) => {
  try {
    const data = await Timetable.find()
      .populate("subjectId")
      .populate("roomId")
      .populate("lecturerId");

    const score = calculateFitness(data);

    res.json({
      score,
      quality:
        score > 80 ? "Excellent" :
        score > 50 ? "Good" : "Poor"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// 🆕 GET AVAILABLE ROOMS for a given day/time
// ============================================================
exports.getAvailableRooms = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.query;
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ message: "Day, startTime, endTime required" });
    }
    const allRooms = await Room.find();
    const busyRooms = await Timetable.find({ day, startTime, endTime }).distinct("roomId");
    const freeRooms = allRooms.filter(r => !busyRooms.some(id => id.equals(r._id)));
    res.json(freeRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// 🆕 GET AVAILABLE TIME SLOTS for a given lecturer/group/room on a day
// ============================================================
exports.getAvailableTimes = async (req, res) => {
  try {
    const { lecturerId, groupId, roomId, day } = req.query;
    if (!day) {
      return res.status(400).json({ message: "Day required" });
    }
    // Generate all possible slots (8-18, 2h steps)
    const allSlots = require("../utils/timeSlotGenerator")();
    // Fetch existing busy slots for any of the resources
    const query = { day };
    const orConditions = [];
    if (lecturerId) orConditions.push({ lecturerId });
    if (groupId) orConditions.push({ groupId });
    if (roomId) orConditions.push({ roomId });
    if (orConditions.length) query.$or = orConditions;

    const busy = await Timetable.find(query).select("startTime endTime");

    const freeSlots = allSlots.filter(slot => {
      return !busy.some(b => 
        require("../utils/timeValidator")(slot.start, slot.end, b.startTime, b.endTime)
      );
    });
    res.json(freeSlots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// 🆕 CHECK DUPLICATE (subject already assigned to group)
// ============================================================
exports.checkDuplicate = async (req, res) => {
  try {
    const { groupId, subjectId } = req.query;
    if (!groupId || !subjectId) {
      return res.status(400).json({ message: "groupId and subjectId required" });
    }
    const exists = await Timetable.findOne({ groupId, subjectId });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// 🆕 AI SUGGESTIONS for a single entry
// ============================================================
exports.suggestSlots = async (req, res) => {
  try {
    const { groupId, subjectId, lecturerId, roomId } = req.body;
    if (!groupId || !subjectId || !lecturerId) {
      return res.status(400).json({ message: "groupId, subjectId, lecturerId required" });
    }

    // Get subject and lecturer (populated)
    const subject = await Subject.findById(subjectId).populate("lecturerId");
    const lecturer = subject.lecturerId;
    const group = await StudentGroup.findById(groupId);
    const rooms = roomId ? [await Room.findById(roomId)] : await Room.find();

    // Generate all possible slots
    const allSlots = require("../utils/timeSlotGenerator")();

    // Fetch existing timetable to check conflicts
    const existing = await Timetable.find({});
    const suggestions = [];

    for (let slot of allSlots) {
      for (let room of rooms) {
        // Check hard conflicts
        let conflict = false;
        for (let entry of existing) {
          if (entry.day !== slot.day) continue;
          if (require("../utils/timeValidator")(slot.start, slot.end, entry.startTime, entry.endTime)) {
            if (
              entry.groupId.equals(groupId) ||
              entry.lecturerId.equals(lecturerId) ||
              entry.roomId.equals(room._id)
            ) {
              conflict = true;
              break;
            }
          }
        }
        if (conflict) continue;

        // Check lecturer's personal availability (if defined)
        let available = true;
        if (lecturer.availability && lecturer.availability.length) {
          available = lecturer.availability.some(
            av => av.day === slot.day && slot.start >= av.startTime && slot.end <= av.endTime
          );
        }
        if (!available) continue;

        // Check room type match (if subject has required type)
        if (subject.requiredRoomType && room.type && subject.requiredRoomType !== room.type) {
          continue; // skip this room for this slot
        }

        // If we reach here, slot is valid
        suggestions.push({
          day: slot.day,
          startTime: slot.start,
          endTime: slot.end,
          roomId: room._id,
          roomName: room.roomName,
          // Optional: compute a soft score for ranking
          score: 100
        });
      }
    }

    // Sort by some heuristic (e.g., lecturer preferred days/times)
    // For simplicity we just return all
    res.json(suggestions.slice(0, 10)); // limit to 10 suggestions
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};