const Timetable = require("../models/Timetable");
const Subject = require("../models/Subject");
const Room = require("../models/Room");
const StudentGroup = require("../models/StudentGroup");
const hasConflict = require("../utils/conflictChecker");
const isLecturerAvailable = require("../utils/availabilityChecker");

const timeSlots = [
  { day: "Mon", start: "09:00", end: "11:00" },
  { day: "Mon", start: "11:00", end: "13:00" },
  { day: "Tue", start: "09:00", end: "11:00" },
  { day: "Wed", start: "09:00", end: "11:00" }
];

const generateTimetable = async () => {
  await Timetable.deleteMany();

  const subjects = await Subject.find().populate("lecturerId");
  const rooms = await Room.find();
  const groups = await StudentGroup.find();

  for (let subject of subjects) {
    for (let group of groups) {

      for (let slot of timeSlots) {
        for (let room of rooms) {

          // ✅ Check lecturer availability
          const available = isLecturerAvailable(
            subject.lecturerId.availability,
            slot.day,
            slot.start,
            slot.end
          );

          if (!available) continue;

          // ✅ Check advanced conflicts
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

            break;
          }
        }
      }
    }
  }
};

module.exports = { generateTimetable };