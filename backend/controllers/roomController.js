const Room = require("../models/Room");

// CREATE
exports.createRoom = async (req, res) => {
  try {
    const { roomName, capacity } = req.body;

    if (!roomName || capacity <= 0) {
      return res.status(400).json({ message: "Invalid room data" });
    }

    const room = await Room.create(req.body);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ
exports.getRooms = async (req, res) => {
  const data = await Room.find();
  res.json(data);
};

// UPDATE
exports.updateRoom = async (req, res) => {
  const updated = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
exports.deleteRoom = async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};