const Timetable = require("../models/Timetable");
const isOverlapping = require("./timeValidator");

const hasAdvancedConflict = async (
  groupId,
  lecturerId,
  roomId,
  day,
  startTime,
  endTime
) => {

  const schedules = await Timetable.find({ day });

  for (let schedule of schedules) {
    const overlap = isOverlapping(
      startTime,
      endTime,
      schedule.startTime,
      schedule.endTime
    );

    if (overlap) {
      if (
        schedule.groupId.equals(groupId) ||
        schedule.lecturerId.equals(lecturerId) ||
        schedule.roomId.equals(roomId)
      ) {
        return true;
      }
    }
  }

  return false;
};

module.exports = hasAdvancedConflict;