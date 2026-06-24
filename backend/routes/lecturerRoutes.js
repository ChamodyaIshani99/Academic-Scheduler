const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/lecturerController");

router.post("/", ctrl.createLecturer);
router.get("/", ctrl.getLecturers);
router.get("/:id", ctrl.getLecturerById); 
router.put("/:id", ctrl.updateLecturer);
router.delete("/:id", ctrl.deleteLecturer);

module.exports = router;