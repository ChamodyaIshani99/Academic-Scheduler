const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomName: String,
  capacity: Number,
  type: String
});

module.exports = mongoose.model("Room", roomSchema);