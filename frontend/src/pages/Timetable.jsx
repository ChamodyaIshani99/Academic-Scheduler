import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";

const defaultForm = {
  groupId: "",
  subjectId: "",
  lecturerId: "",
  roomId: "",
  day: "Monday",
  startTime: "08:00",
  endTime: "10:00"
};

export default function Timetable() {
  const [schedule, setSchedule] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [aiStatus, setAiStatus] = useState("");

  const loadAll = async () => {
    try {
      const [timetableRes, groupsRes, subjectsRes, lecturersRes, roomsRes] = await Promise.all([
        API.get("/timetable"),
        API.get("/student-groups"),
        API.get("/subjects"),
        API.get("/lecturers"),
        API.get("/rooms")
      ]);
      setSchedule(timetableRes.data);
      setGroups(groupsRes.data);
      setSubjects(subjectsRes.data);
      setLecturers(lecturersRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load timetable data.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const hasOverlap = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
  };

  const getConflictReason = () => {
    const { groupId, lecturerId, roomId, day, startTime, endTime } = form;
    if (!groupId || !lecturerId || !roomId) return "";

    const conflict = schedule.find((entry) => {
      if (entry.day !== day) return false;
      const overlap = hasOverlap(startTime, endTime, entry.startTime, entry.endTime);
      if (!overlap) return false;
      if (entry.lecturerId?._id === lecturerId || entry.lecturerId === lecturerId) return true;
      if (entry.groupId?._id === groupId || entry.groupId === groupId) return true;
      if (entry.roomId?._id === roomId || entry.roomId === roomId) return true;
      return false;
    });

    if (!conflict) return "";
    if (conflict.lecturerId?._id === lecturerId || conflict.lecturerId === lecturerId) {
      return "❌ Lecturer already assigned at this time.";
    }
    if (conflict.groupId?._id === groupId || conflict.groupId === groupId) {
      return "❌ Group already has a class at this time.";
    }
    if (conflict.roomId?._id === roomId || conflict.roomId === roomId) {
      return "❌ Room already assigned at this time.";
    }

    return "❌ Time conflict detected.";
  };

  const selectedGroup = groups.find((group) => group._id === form.groupId);
  const selectedLecturerSubjects = subjects.filter((subject) => {
    const lecturerRef = subject.lecturerId;
    const lecturerId = lecturerRef?._id || lecturerRef;
    return lecturerId === form.lecturerId;
  });

  const handleCreate = async () => {
    setErrorMessage("");
    setStatusMessage("");

    const conflictReason = getConflictReason();
    if (conflictReason) {
      setErrorMessage(conflictReason);
      return;
    }

    try {
      await API.post("/timetable", {
        groupId: form.groupId,
        subjectId: form.subjectId,
        lecturerId: form.lecturerId,
        roomId: form.roomId,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime
      });
      setForm(defaultForm);
      setStatusMessage("✅ Manual timetable entry saved successfully.");
      loadAll();
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setErrorMessage(`Error adding entry: ${message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/timetable/${id}`);
      loadAll();
      setStatusMessage("✅ Entry deleted.");
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to delete entry.");
    }
  };

  const generateBasic = async () => {
    setErrorMessage("");
    setStatusMessage("");
    setAiStatus("Generating timetable with the basic planner...");
    try {
      await API.post("/timetable/generate");
      setAiStatus("✅ Timetable generated using the basic algorithm.");
      loadAll();
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to generate timetable.");
      setAiStatus("");
    }
  };

  const generateAI = async () => {
    setErrorMessage("");
    setStatusMessage("");
    setAiStatus("Running AI timetable generation...");
    try {
      await API.post("/timetable/generate-ai");
      setAiStatus("🤖 AI timetable generated successfully.");
      loadAll();
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to generate AI timetable.");
      setAiStatus("");
    }
  };

  const clearAll = async () => {
    try {
      await API.delete("/timetable");
      setStatusMessage("✅ All timetable entries cleared.");
      setErrorMessage("");
      loadAll();
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to clear timetable.");
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const timeSlots = useMemo(() => {
    const uniqueSlots = Array.from(
      new Set(schedule.map((entry) => `${entry.startTime}-${entry.endTime}`))
    );
    return uniqueSlots.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [schedule]);

  const timetableGrid = useMemo(() => {
    return timeSlots.map((slot) => {
      const [startTime, endTime] = slot.split("-");
      const row = { time: `${startTime} - ${endTime}`, cells: {} };
      days.forEach((day) => {
        row.cells[day] = schedule.filter(
          (entry) => entry.day === day && entry.startTime === startTime && entry.endTime === endTime
        );
      });
      return row;
    });
  }, [timeSlots, schedule]);

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Timetable</p>
              <h1 className="text-3xl font-semibold text-slate-950">Schedule generation</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateBasic}
                className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate basic
              </button>
              <button
                onClick={generateAI}
                className="rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Generate AI
              </button>
              <button
                onClick={clearAll}
                className="rounded-3xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Create a manual timetable slot</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <select
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Student group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.groupId}
                    </option>
                  ))}
                </select>
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.lecturerId}
                  onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.roomName}
                    </option>
                  ))}
                </select>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
              </div>

              {(selectedGroup || form.lecturerId) && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  {selectedGroup && (
                    <div className="mb-3">
                      <p className="font-semibold text-slate-900">Group preview</p>
                      <p>{selectedGroup.groupId} • {selectedGroup.department || "No dept"} • Year {selectedGroup.year || "N/A"}</p>
                      <p>{selectedGroup.students?.length || 0} students assigned</p>
                    </div>
                  )}
                  {form.lecturerId && (
                    <div>
                      <p className="font-semibold text-slate-900">Lecturer preview</p>
                      <p>{selectedLecturerSubjects.length > 0 ? selectedLecturerSubjects.map((subject) => subject.name).join(", ") : "No subjects assigned."}</p>
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}
              {statusMessage && (
                <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {statusMessage}
                </div>
              )}

              <button
                onClick={handleCreate}
                className="mt-6 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create timetable entry
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Quick actions</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Generate the full timetable using the built-in solver, then review the results below.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={generateBasic}
                    className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Generate basic
                  </button>
                  <button
                    onClick={generateAI}
                    className="rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Generate AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Timetable entries</p>
              <h2 className="text-2xl font-semibold text-slate-950">Current schedule</h2>
            </div>
            <p className="text-sm text-slate-500">Delete entries individually after reviewing conflicts.</p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Lecturer</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schedule.map((row) => (
                  <tr key={row._id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">{row.day}</td>
                    <td className="px-4 py-4 text-slate-600">{row.startTime} - {row.endTime}</td>
                    <td className="px-4 py-4 text-slate-600">{row.groupId?.groupId || "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{row.subjectId?.name || "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{row.lecturerId?.name || "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{row.roomId?.roomName || "—"}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="rounded-3xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
