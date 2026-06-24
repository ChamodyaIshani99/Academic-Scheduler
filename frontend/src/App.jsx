import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentGroups from "./pages/StudentGroups";
import Lecturers from "./pages/Lecturers";
import Rooms from "./pages/Rooms";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Departments from "./pages/Departments"; // ⭐ ADD

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* 🔐 PUBLIC ROUTE */}
      <Route path="/login" element={<Login />} />

      {/* 🔄 REDIRECT ROOT */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* 🏠 DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["Admin", "Lecturer", "Student"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 👨‍🎓 STUDENTS */}
      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />

      {/* 👥 GROUPS */}
      <Route
        path="/student-groups"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <StudentGroups />
          </ProtectedRoute>
        }
      />

      {/* 👩‍🏫 LECTURERS */}
      <Route
        path="/lecturers"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Lecturers />
          </ProtectedRoute>
        }
      />

      {/* 🏢 DEPARTMENTS ⭐ */}
      <Route
        path="/departments"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Departments />
          </ProtectedRoute>
        }
      />

      {/* 🏫 ROOMS */}
      <Route
        path="/rooms"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Rooms />
          </ProtectedRoute>
        }
      />

      {/* 📚 SUBJECTS */}
      <Route
        path="/subjects"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Subjects />
          </ProtectedRoute>
        }
      />

      {/* 📅 TIMETABLE */}
      <Route
        path="/timetable"
        element={
          <ProtectedRoute roles={["Admin", "Lecturer", "Student"]}>
            <Timetable />
          </ProtectedRoute>
        }
      />

      {/* ❌ 404 */}
      <Route path="*" element={<h1 className="p-10">Page Not Found</h1>} />

    </Routes>
  );
}

export default App;