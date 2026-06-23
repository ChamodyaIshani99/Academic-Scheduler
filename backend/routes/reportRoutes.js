const express = require("express");
const router = express.Router();
const report = require("../controllers/reportController");

router.get("/lecturers", report.lecturerReport);
router.get("/rooms", report.roomReport);

module.exports = router;