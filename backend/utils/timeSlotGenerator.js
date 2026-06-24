// utils/timeSlotGenerator.js

/**
 * Generate all possible time slots for a given set of days, within working hours.
 * @param {Object} options
 * @param {Array<string>} options.days - list of day names (e.g., ["Mon","Tue"])
 * @param {number} options.startHour - inclusive start hour (e.g., 8)
 * @param {number} options.endHour - exclusive end hour (e.g., 18)
 * @param {number} options.stepHours - duration of each slot in hours (e.g., 2)
 * @returns {Array<Object>} array of { day, start, end } with times as "HH:MM"
 */
const generateTimeSlots = (options = {}) => {
  const {
    days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startHour = 8,
    endHour = 18,
    stepHours = 2
  } = options;

  const slots = [];
  for (let day of days) {
    for (let h = startHour; h < endHour; h += stepHours) {
      const start = `${String(h).padStart(2, "0")}:00`;
      const end = `${String(h + stepHours).padStart(2, "0")}:00`;
      slots.push({ day, start, end });
    }
  }
  return slots;
};

module.exports = generateTimeSlots;