const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/seed (for local development only)
router.get("/seed", authController.seedUsers);

module.exports = router;
