const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/departmentController");

// CREATE (Admin only)
router.post("/", ctrl.createDepartment);

// READ ALL
router.get("/", ctrl.getDepartments);

// UPDATE ⭐
router.put("/:id", ctrl.updateDepartment);

// DELETE
router.delete("/:id", ctrl.deleteDepartment);

module.exports = router;