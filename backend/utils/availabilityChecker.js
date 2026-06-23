const isOverlapping = require("./timeValidator");

const isLecturerAvailable = (availability, day, startTime, endTime) => {

  const available = availability.some(slot => {
    if (slot.day !== day) return false;

    return (
      startTime >= slot.startTime &&
      endTime <= slot.endTime
    );
  });

  return available;
};

module.exports = isLecturerAvailable;