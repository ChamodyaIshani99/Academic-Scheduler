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

  // Fitness & UI states
  const [score, setScore] = useState(null);
  const [scoreQuality, setScoreQuality] = useState("");
  const [scoreLoading, setScoreLoading] = useState(false);

  // Dynamic availability states
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // AI Suggestion Modal
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load all data
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
      await fetchScore();
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load timetable data.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Fetch fitness score
  const fetchScore = async () => {
    setScoreLoading(true);
    try {
      const res = await API.get("/timetable/score");
      setScore(res.data.score);
      setScoreQuality(res.data.quality || "Unknown");
    } catch (err) {
      console.error(err);
      setScore(null);
    } finally {
      setScoreLoading(false);
    }
  };

  // ============================================================
  // DYNAMIC AVAILABILITY FETCHING
  // ============================================================

  // Fetch available rooms when day/time changes
  useEffect(() => {
    if (form.day && form.startTime && form.endTime) {
      API.get("/timetable/available-rooms", {
        params: { day: form.day, startTime: form.startTime, endTime: form.endTime }
      })
        .then(res => setAvailableRooms(res.data))
        .catch(err => console.error(err));
    } else {
      setAvailableRooms([]);
    }
  }, [form.day, form.startTime, form.endTime]);

  // Fetch available times when lecturer/group/room/day changes
  useEffect(() => {
    if (form.day && (form.lecturerId || form.groupId || form.roomId)) {
      const params = { day: form.day };
      if (form.lecturerId) params.lecturerId = form.lecturerId;
      if (form.groupId) params.groupId = form.groupId;
      if (form.roomId) params.roomId = form.roomId;
      API.get("/timetable/available-times", { params })
        .then(res => setAvailableTimes(res.data))
        .catch(err => console.error(err));
    } else {
      setAvailableTimes([]);
    }
  }, [form.day, form.lecturerId, form.groupId, form.roomId]);

  // Check duplicate when group/subject changes
  useEffect(() => {
    if (form.groupId && form.subjectId) {
      setCheckingDuplicate(true);
      API.get("/timetable/check-duplicate", {
        params: { groupId: form.groupId, subjectId: form.subjectId }
      })
        .then(res => {
          if (res.data.exists) {
            setErrorMessage("❌ This subject is already assigned to this group.");
          } else {
            setErrorMessage("");
          }
        })
        .catch(err => console.error(err))
        .finally(() => setCheckingDuplicate(false));
    } else {
      setErrorMessage("");
    }
  }, [form.groupId, form.subjectId]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleCreate = async () => {
    setErrorMessage("");
    setStatusMessage("");

    // Duplicate check already done in real‑time
    if (errorMessage) return;

    // Validate required fields
    if (!form.groupId || !form.subjectId || !form.lecturerId || !form.roomId) {
      setErrorMessage("Please fill all required fields.");
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
      await loadAll();
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setErrorMessage(`Error adding entry: ${message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/timetable/${id}`);
      await loadAll();
      setStatusMessage("✅ Entry deleted.");
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to delete entry.");
    }
  };

  // ============================================================
  // AI SUGGESTIONS
  // ============================================================
  const fetchSuggestions = async () => {
    if (!form.groupId || !form.subjectId || !form.lecturerId) {
      setErrorMessage("Please select group, subject, and lecturer first.");
      return;
    }
    setLoadingSuggestions(true);
    setShowSuggestModal(true);
    try {
      const res = await API.post("/timetable/suggest", {
        groupId: form.groupId,
        subjectId: form.subjectId,
        lecturerId: form.lecturerId,
        roomId: form.roomId || undefined
      });
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to fetch suggestions.");
      setShowSuggestModal(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const selectSuggestion = (slot) => {
    // Fill form with the chosen slot
    setForm({
      ...form,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomId: slot.roomId
    });
    setShowSuggestModal(false);
    setStatusMessage("✅ Suggestion applied. You can now save.");
  };

  // ============================================================
  // RENDER
  // ============================================================

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const selectedGroup = groups.find(g => g._id === form.groupId);
  const selectedLecturerSubjects = subjects.filter(s => {
    const ref = s.lecturerId?._id || s.lecturerId;
    return ref === form.lecturerId;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header + Fitness Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Timetable</p>
              <h1 className="text-3xl font-semibold text-slate-950">Schedule generation</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { /* existing generate basic */ }}
                className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate basic
              </button>
              <button
                onClick={fetchSuggestions}
                className="rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                AI Suggest
              </button>
              <button
                onClick={() => { /* clear all */ }}
                className="rounded-3xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Fitness Score Card */}
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">📊 Fitness Score</span>
              {scoreLoading ? (
                <span className="text-sm text-slate-400">Loading...</span>
              ) : score !== null ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-900">{score}</span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getScoreColor(scoreQuality)}`}>
                    {scoreQuality}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-400">No schedule yet</span>
              )}
            </div>
            <button
              onClick={fetchScore}
              className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>

          {/* Manual Entry Form */}
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
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.groupId}</option>
                  ))}
                </select>

                <select
                  value={form.subjectId}
                  onChange={(e) => {
                    const subj = subjects.find(s => s._id === e.target.value);
                    setForm({
                      ...form,
                      subjectId: e.target.value,
                      lecturerId: subj?.lecturerId?._id || subj?.lecturerId || ""
                    });
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={form.lecturerId}
                  onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Lecturer</option>
                  {lecturers.map((l) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>

                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Time dropdown (available times) */}
                <select
                  value={form.startTime}
                  onChange={(e) => {
                    const selected = availableTimes.find(t => t.start === e.target.value);
                    setForm({
                      ...form,
                      startTime: e.target.value,
                      endTime: selected?.end || ""
                    });
                  }}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  disabled={!availableTimes.length}
                >
                  <option value="">Time</option>
                  {availableTimes.map((slot) => (
                    <option key={slot.start} value={slot.start}>
                      {slot.start} - {slot.end}
                    </option>
                  ))}
                </select>

                {/* Room dropdown (available rooms) */}
                <select
                  value={form.roomId}
                  onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  disabled={!availableRooms.length}
                >
                  <option value="">Room</option>
                  {availableRooms.map((r) => (
                    <option key={r._id} value={r._id}>{r.roomName}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              {(selectedGroup || form.lecturerId) && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  {selectedGroup && (
                    <div className="mb-3">
                      <p className="font-semibold text-slate-900">Group preview</p>
                      <p>{selectedGroup.groupId} • {selectedGroup.department || "No dept"} • Year {selectedGroup.year || "N/A"}</p>
                      <p>{selectedGroup.students?.length || 0} students</p>
                    </div>
                  )}
                  {form.lecturerId && (
                    <div>
                      <p className="font-semibold text-slate-900">Lecturer preview</p>
                      <p>{selectedLecturerSubjects.length > 0 ? selectedLecturerSubjects.map(s => s.name).join(", ") : "No subjects assigned."}</p>
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
                disabled={!!errorMessage || checkingDuplicate}
                className="mt-6 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {checkingDuplicate ? "Checking..." : "Create timetable entry"}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Quick actions</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Use <strong>AI Suggest</strong> to get a conflict‑free slot for the selected group, subject, and lecturer.
                </div>
                <button
                  onClick={fetchSuggestions}
                  className="w-full rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  🤖 AI Suggest
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Timetable Table */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Timetable entries</p>
              <h2 className="text-2xl font-semibold text-slate-950">Current schedule</h2>
            </div>
            <p className="text-sm text-slate-500">{schedule.length} entries</p>
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

      {/* ============================================================
          AI SUGGESTIONS MODAL
          ============================================================ */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">🤖 AI Suggestions</h3>
              <button
                onClick={() => setShowSuggestModal(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            {loadingSuggestions ? (
              <div className="py-8 text-center text-slate-500">Searching for available slots...</div>
            ) : suggestions.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No available slots found. Try changing the day or adding more rooms.</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th className="pb-2 pr-4">Day</th>
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Room</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((slot, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium">{slot.day}</td>
                        <td className="py-3 pr-4">{slot.startTime} - {slot.endTime}</td>
                        <td className="py-3 pr-4">{slot.roomName}</td>
                        <td className="py-3">
                          <button
                            onClick={() => selectSuggestion(slot)}
                            className="rounded-3xl bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSuggestModal(false)}
                className="rounded-3xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Helper for score colour
function getScoreColor(quality) {
  if (quality === "Excellent") return "text-emerald-600 bg-emerald-50";
  if (quality === "Good") return "text-blue-600 bg-blue-50";
  if (quality === "Poor") return "text-rose-600 bg-rose-50";
  return "text-slate-600 bg-slate-50";
}