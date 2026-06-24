const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student-groups", require("./routes/studentGroupRoutes"));
app.use("/api/lecturers", require("./routes/lecturerRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));

module.exports = app;