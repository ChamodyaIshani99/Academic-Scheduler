import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-blue-600 text-white p-4 flex gap-4">
      <Link to="/">Dashboard</Link>
      <Link to="/students">Students</Link>
      <Link to="/lecturers">Lecturers</Link>
      <Link to="/rooms">Rooms</Link>
      <Link to="/subjects">Subjects</Link>
      <Link to="/timetable">Timetable</Link>
    </div>
  );
}