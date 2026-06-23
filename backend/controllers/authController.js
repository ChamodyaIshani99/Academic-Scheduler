const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "8h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedUsers = async (req, res) => {
  try {
    const existing = await User.findOne({ email: "admin@example.com" });
    if (existing) return res.json({ message: "Users already seeded" });

    const users = [
      { name: "Admin User", email: "admin@example.com", password: "adminpass", role: "Admin" },
      { name: "Lecturer One", email: "lecturer@example.com", password: "lecturerpass", role: "Lecturer" },
      { name: "Student One", email: "student@example.com", password: "studentpass", role: "Student" }
    ];

    for (const u of users) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(u.password, salt);
      await User.create({ name: u.name, email: u.email, password: hash, role: u.role });
    }

    res.json({ message: "Seeded users" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
