// services/schedulerService.js
const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const StudentGroup = require("../models/StudentGroup");
const hasConflict = require("../utils/conflictChecker");
const isLecturerAvailable = require("../utils/availabilityChecker");
const generateTimeSlots = require("../utils/timeSlotGenerator");

// ===== Dynamic time slots =====
const timeSlots = generateTimeSlots(); // default: Mon–Fri, 8–18, 2‑hour steps

const generateTimetable = async () => {
  await Timetable.deleteMany();

  const subjects = await Subject.find().populate("lecturerId");
  const rooms = await Room.find();
  const groups = await StudentGroup.find();

  for (let subject of subjects) {
    for (let group of groups) {
      let assigned = false;

      for (let slot of timeSlots) {
        for (let room of rooms) {
          // Check lecturer availability (from the Lecturer document)
          const available = isLecturerAvailable(
            subject.lecturerId.availability,
            slot.day,
            slot.start,
            slot.end
          );

          if (!available) continue;

          // Check advanced conflicts (group, lecturer, room)
          const conflict = await hasConflict(
            group._id,
            subject.lecturerId._id,
            room._id,
            slot.day,
            slot.start,
            slot.end
          );

          if (!conflict) {
            await Timetable.create({
              groupId: group._id,
              subjectId: subject._id,
              lecturerId: subject.lecturerId._id,
              roomId: room._id,
              day: slot.day,
              startTime: slot.start,
              endTime: slot.end
            });

            assigned = true;
            break;
          }
        }
        if (assigned) break;
      }

      if (!assigned) {
        console.warn(
          `Could not schedule subject "${subject.name}" for group "${group.groupId}"`
        );
      }
    }
  }
};

module.exports = { generateTimetable };