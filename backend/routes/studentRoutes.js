const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Create, Update, Delete require admin
router.post("/", requireAuth, requireRole(["Admin"]), ctrl.createStudent);
router.get("/", ctrl.getStudents);
router.get("/:id", ctrl.getStudentById);
router.put("/:id", requireAuth, requireRole(["Admin"]), ctrl.updateStudent);
router.delete("/:id", requireAuth, requireRole(["Admin"]), ctrl.deleteStudent);

module.exports = router;