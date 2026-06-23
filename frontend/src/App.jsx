import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentGroups from "./pages/StudentGroups";
import Lecturers from "./pages/Lecturers";
import Rooms from "./pages/Rooms";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute roles={["Admin", "Lecturer", "Student"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Students />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-groups"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <StudentGroups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturers"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Lecturers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Rooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <Subjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetable"
        element={
          <ProtectedRoute roles={["Admin", "Lecturer", "Student"]}>
            <Timetable />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;