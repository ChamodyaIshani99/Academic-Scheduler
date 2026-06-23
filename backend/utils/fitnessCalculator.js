const isOverlapping = require("./timeValidator");

const calculateFitness = (timetable) => {
  let conflicts = 0;

  for (let i = 0; i < timetable.length; i++) {
    for (let j = i + 1; j < timetable.length; j++) {
      const a = timetable[i];
      const b = timetable[j];

      if (a.day !== b.day) continue;

      const overlap = isOverlapping(
        a.startTime, a.endTime,
        b.startTime, b.endTime
      );

      if (overlap) {
        if (
          a.roomId.toString() === b.roomId.toString() ||
          a.lecturerId.toString() === b.lecturerId.toString() ||
          a.groupId.toString() === b.groupId.toString()
        ) {
          conflicts++;
        }
      }
    }
  }

  // lower conflicts = better
  return 1 / (1 + conflicts);
};

module.exports = calculateFitness;