const timeSlots = [
  { day: "Mon", start: "09:00", end: "11:00" },
  { day: "Mon", start: "11:00", end: "13:00" },
  { day: "Tue", start: "09:00", end: "11:00" },
  { day: "Wed", start: "09:00", end: "11:00" }
];

const generateRandomTimetable = (subjects, rooms, groups) => {
  let timetable = [];

  for (let subject of subjects) {
    for (let group of groups) {
      const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];

      timetable.push({
        groupId: group._id,
        subjectId: subject._id,
        lecturerId: subject.lecturerId,
        roomId: room._id,
        day: slot.day,
        startTime: slot.start,
        endTime: slot.end
      });
    }
  }

  return timetable;
};

module.exports = generateRandomTimetable;