const express = require("express");
const router = express.Router();
const controller = require("../controllers/timetableController");

router.post("/generate", controller.generate);
router.post("/generate-ai", controller.generateAI);

router.post("/", controller.createTimetable);
router.get("/", controller.getAllTimetable);
router.put("/:id", controller.updateTimetable);
router.delete("/:id", controller.deleteTimetable);
router.delete("/", controller.deleteAllTimetable);

module.exports = router;
