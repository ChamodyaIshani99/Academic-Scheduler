const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/roomController");

router.post("/", ctrl.createRoom);
router.get("/", ctrl.getRooms);
router.put("/:id", ctrl.updateRoom);
router.delete("/:id", ctrl.deleteRoom);

module.exports = router;