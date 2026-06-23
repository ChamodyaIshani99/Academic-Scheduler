const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/subjectController");

router.post("/", ctrl.createSubject);
router.get("/", ctrl.getSubjects);
router.put("/:id", ctrl.updateSubject);
router.delete("/:id", ctrl.deleteSubject);

module.exports = router;