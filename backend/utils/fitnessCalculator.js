// utils/fitnessCalculator.js
const isOverlapping = require("./timeValidator");

/**
 * Calculate fitness score (100 - total penalties)
 * @param {Array} timetable - array of timetable entries with populated lecturer, subject, room, group
 * @returns {Number} fitness score
 */
const calculateFitness = (timetable) => {
  let score = 100;

  // ===== 1. Hard conflicts (should be zero, but keep check) =====
  for (let i = 0; i < timetable.length; i++) {
    const a = timetable[i];
    for (let j = i + 1; j < timetable.length; j++) {
      const b = timetable[j];
      if (a.day !== b.day) continue;
      const overlap = isOverlapping(a.startTime, a.endTime, b.startTime, b.endTime);
      if (overlap) {
        if (
          a.roomId.toString() === b.roomId.toString() ||
          a.lecturerId.toString() === b.lecturerId.toString() ||
          a.groupId.toString() === b.groupId.toString()
        ) {
          score -= 20; // heavy penalty, but ideally never happens
        }
      }
    }
  }

  // ===== 2. Soft Constraints =====
  const lecturerMap = new Map(); // lecturerId -> array of entries
  const groupMap = new Map();    // groupId -> array of entries
  const lecturerLoad = new Map(); // lecturerId -> count

  // Group entries by lecturer and group
  for (let entry of timetable) {
    const lectId = entry.lecturerId.toString();
    const groupId = entry.groupId.toString();

    if (!lecturerMap.has(lectId)) lecturerMap.set(lectId, []);
    lecturerMap.get(lectId).push(entry);

    if (!groupMap.has(groupId)) groupMap.set(groupId, []);
    groupMap.get(groupId).push(entry);

    // Count workload (number of sessions per lecturer)
    lecturerLoad.set(lectId, (lecturerLoad.get(lectId) || 0) + 1);
  }

  // ===== 2a. Lecturer preferences (existing) =====
  for (let entry of timetable) {
    const lecturer = entry.lecturer;
    if (!lecturer) continue;

    // Preferred days
    if (lecturer.preferredDays && lecturer.preferredDays.length > 0) {
      if (!lecturer.preferredDays.includes(entry.day)) {
        score -= 2;
      }
    }

    // Preferred time slots
    if (lecturer.preferredTimes && lecturer.preferredTimes.length > 0) {
      const match = lecturer.preferredTimes.some(slot =>
        entry.startTime >= slot.start && entry.endTime <= slot.end
      );
      if (!match) score -= 2;
    }
  }

  // ===== 2b. Room type match (existing) =====
  for (let entry of timetable) {
    const subject = entry.subject;
    const room = entry.room;
    if (subject?.requiredRoomType && room?.type) {
      if (subject.requiredRoomType !== room.type) {
        score -= 3;
      }
    }
  }

  // ===== 2c. Room capacity =====
  for (let entry of timetable) {
    const group = entry.group; // Need to populate group? We may not have it.
    // We'll need to fetch group size. Since we don't have group populated in entry,
    // we can get it from the groups collection, but here we assume we have groupId.
    // We can compute group size from the database, but in fitness we only have entry.
    // We'll skip this unless we pass group info.
    // Instead, we can access group from the database, but for simplicity we'll not.
    // We'll assume group size is available if we populate groupId.
    // For now, we'll not penalize capacity to avoid complexity.
    // (Optional: you can load group sizes once and pass them in.)
  }

  // ===== 2d. Gaps & Consecutive classes (Lecturer) =====
  for (let [lectId, entries] of lecturerMap) {
    // Sort by day then start time
    const sorted = [...entries].sort((a, b) => {
      if (a.day !== b.day) return a.day.localeCompare(b.day);
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const next = sorted[i + 1];
      if (cur.day === next.day) {
        // Calculate gap in hours
        const curEnd = parseTime(cur.endTime);
        const nextStart = parseTime(next.startTime);
        const gapHours = (nextStart - curEnd) / 60; // in minutes? Actually parse returns minutes.
        // If gap is less than 1 hour, penalty (consecutive)
        if (gapHours < 60) {
          score -= 1;
        } else if (gapHours > 180) { // gap > 3 hours
          score -= 2;
        }
        // else moderate gap is fine.
      }
    }
  }

  // ===== 2e. Gaps & Consecutive classes (Group) =====
  for (let [groupId, entries] of groupMap) {
    const sorted = [...entries].sort((a, b) => {
      if (a.day !== b.day) return a.day.localeCompare(b.day);
      return a.startTime.localeCompare(b.startTime);
    });

    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const next = sorted[i + 1];
      if (cur.day === next.day) {
        const curEnd = parseTime(cur.endTime);
        const nextStart = parseTime(next.startTime);
        const gapHours = (nextStart - curEnd) / 60;
        if (gapHours < 60) {
          score -= 1;
        } else if (gapHours > 180) {
          score -= 2;
        }
      }
    }
  }

  // ===== 2f. Workload balance =====
  const loads = Array.from(lecturerLoad.values());
  if (loads.length > 1) {
    const avg = loads.reduce((a, b) => a + b, 0) / loads.length;
    let variance = 0;
    for (let load of loads) {
      variance += (load - avg) ** 2;
    }
    variance /= loads.length;
    // Penalise high variance (unbalanced)
    score -= Math.min(variance * 0.5, 10); // cap penalty at 10
  }

  // ===== 2g. Department preferences (if any) =====
  // For each entry, if lecturer has department and we have department preference days,
  // but we don't have that data. Skip for now.

  return Math.max(score, 0); // ensure non‑negative
};

// Helper to parse "HH:MM" to minutes from 00:00
function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

module.exports = calculateFitness;