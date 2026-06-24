// routes/timetableRoutes.js
const express = require("express");
const router = express.Router();

// Import the controller (make sure the path is correct)
const timetableController = require("../controllers/timetableController");

// ============================================================
// EXISTING ROUTES
// ============================================================

// CREATE a manual entry
router.post("/", timetableController.createTimetable);

// READ all entries (with populated references)
router.get("/", timetableController.getAllTimetable);

// UPDATE an entry
router.put("/:id", timetableController.updateTimetable);

// DELETE a single entry
router.delete("/:id", timetableController.deleteTimetable);

// DELETE all entries
router.delete("/", timetableController.deleteAllTimetable);

// Generate using basic algorithm
router.post("/generate", timetableController.generate);

// Generate using AI (Genetic Algorithm)
router.post("/generate-ai", timetableController.generateAI);

// Get fitness score
router.get("/score", timetableController.getTimetableScore);

// ============================================================
// NEW ROUTES (for dynamic availability and AI suggestions)
// ============================================================

// Get available rooms for a given day/time
router.get("/available-rooms", timetableController.getAvailableRooms);

// Get available time slots for a given lecturer/group/room on a day
router.get("/available-times", timetableController.getAvailableTimes);

// Check if a subject is already assigned to a group
router.get("/check-duplicate", timetableController.checkDuplicate);

// Get AI‑suggested slots for a given subject, group, lecturer
router.post("/suggest", timetableController.suggestSlots);

// ============================================================
// (Optional) Reports – already defined in controller
// ============================================================
router.get("/lecturer/:id", timetableController.getLecturerSchedule);
router.get("/room/:id", timetableController.getRoomSchedule);
router.get("/group/:id", timetableController.getGroupSchedule);

module.exports = router;