const express = require("express");
const router = express.Router();
const studentGroupController = require("../controllers/studentGroupController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// All routes require auth and admin role
router.use(requireAuth);
router.use(requireRole(["Admin"]));

// CREATE GROUP
router.post("/", studentGroupController.createGroup);

// GET ALL GROUPS
router.get("/", studentGroupController.getGroups);

// GET GROUP BY ID
router.get("/:id", studentGroupController.getGroupById);

// UPDATE GROUP
router.put("/:id", studentGroupController.updateGroup);

// DELETE GROUP
router.delete("/:id", studentGroupController.deleteGroup);

// ADD STUDENT TO GROUP
router.post("/:id/add-student", studentGroupController.addStudentToGroup);

// REMOVE STUDENT FROM GROUP
router.post("/:id/remove-student", studentGroupController.removeStudentFromGroup);

module.exports = router;
