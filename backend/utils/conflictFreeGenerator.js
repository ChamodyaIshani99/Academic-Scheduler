// utils/conflictFreeGenerator.js
const isOverlapping = require("./timeValidator");

/**
 * Generate a random conflict‑free timetable
 * @param {Array} subjects - populated with lecturerId (full Lecturer document)
 * @param {Array} rooms - array of Room documents
 * @param {Array} groups - array of StudentGroup documents
 * @param {Array} timeSlots - array of { day, start, end }
 * @returns {Array} timetable entries
 */
const generateConflictFree = (subjects, rooms, groups, timeSlots) => {
  const timetable = [];
  const used = {}; // key: resource_type_id_slotKey

  // Shuffle to add randomness
  const shuffledSubjects = shuffle(subjects);
  const shuffledGroups = shuffle(groups);

  for (let subject of shuffledSubjects) {
    for (let group of shuffledGroups) {
      const shuffledSlots = shuffle(timeSlots);
      const shuffledRooms = shuffle(rooms);
      let assigned = false;

      for (let slot of shuffledSlots) {
        for (let room of shuffledRooms) {
          const slotKey = `${slot.day}_${slot.start}_${slot.end}`;

          // Check hard conflicts
          const groupKey = `group_${group._id}_${slotKey}`;
          const lecturerKey = `lecturer_${subject.lecturerId._id}_${slotKey}`;
          const roomKey = `room_${room._id}_${slotKey}`;

          if (used[groupKey] || used[lecturerKey] || used[roomKey]) continue;

          // Check lecturer's personal availability (if defined)
          const lecturer = subject.lecturerId;
          let available = true;
          if (lecturer.availability && lecturer.availability.length > 0) {
            available = lecturer.availability.some(
              av => av.day === slot.day && slot.start >= av.startTime && slot.end <= av.endTime
            );
          }

          if (!available) continue;

          // Assign
          timetable.push({
            groupId: group._id,
            subjectId: subject._id,
            lecturerId: lecturer._id,
            roomId: room._id,
            subject: subject,
            room: room,
            lecturer: lecturer,
            day: slot.day,
            startTime: slot.start,
            endTime: slot.end
          });

          // Mark as used
          used[groupKey] = true;
          used[lecturerKey] = true;
          used[roomKey] = true;

          assigned = true;
          break;
        }
        if (assigned) break;
      }

      if (!assigned) {
        // Could not find a slot – log a warning (optional)
        console.warn(
          `Could not assign subject "${subject.name}" for group "${group.groupId}"`
        );
      }
    }
  }

  return timetable;
};

// Fisher–Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = generateConflictFree;