import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import { Plus, Trash2, Edit2, Search } from "lucide-react";

export default function Lecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);


  // Form for adding a new lecturer
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    subjects: "",     // comma‑separated string
    startTime: "",
    endTime: ""
  });

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    subjects: "",
    startTime: "",
    endTime: ""
  });

  // Fetch lecturers
  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/lecturers");
      setLecturers(res.data);
    } catch (err) {
      alert("Error fetching lecturers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      alert("Error fetching departments");
    }
  };
  useEffect(() => {
    fetchLecturers();
    fetchDepartments(); // ⭐ ADD THIS
  }, []);

  // Search filter
  const visibleLecturers = useMemo(() => {
    return lecturers.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.specialization || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [lecturers, search]);

  // Transform form data to backend schema
  const formatData = (data) => ({
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    department: data.department,
    specialization: data.specialization || undefined,
    subjects: data.subjects
      ? data.subjects.split(",").map((s) => ({ name: s.trim() })).filter(s => s.name)
      : [],
    availability: data.startTime && data.endTime
      ? [{ day: "Mon", startTime: data.startTime, endTime: data.endTime }]
      : []
  });

  // Create lecturer
  const handleAdd = async () => {
    try {
      if (!form.name || !form.email || !form.department) {
        alert("Name, Email, and Department are required");
        return;
      }
      await API.post("/lecturers", formatData(form));
      setForm({
        name: "",
        email: "",
        phone: "",
        department: "",
        specialization: "",
        subjects: "",
        startTime: "",
        endTime: ""
      });
      fetchLecturers();
      alert("Lecturer added successfully");
    } catch (err) {
      alert("Error adding lecturer: " + err.response?.data?.message || err.message);
    }
  };

  // Start editing
  const handleEdit = (lecturer) => {
    setEditingId(lecturer._id);
    setEditForm({
      name: lecturer.name || "",
      email: lecturer.email || "",
      phone: lecturer.phone || "",
      department: lecturer.department || "",
      specialization: lecturer.specialization || "",
      subjects: (lecturer.subjects || []).map((s) => s.name).join(", "),
      startTime: lecturer.availability?.[0]?.startTime || "",
      endTime: lecturer.availability?.[0]?.endTime || ""
    });
  };

  // Update lecturer
  const handleUpdate = async (id) => {
    try {
      if (!editForm.name || !editForm.email || !editForm.department) {
        alert("Name, Email, and Department are required");
        return;
      }
      await API.put(`/lecturers/${id}`, formatData(editForm));
      setEditingId(null);
      fetchLecturers();
      alert("Lecturer updated successfully");
    } catch (err) {
      alert("Error updating lecturer: " + err.response?.data?.message || err.message);
    }
  };

  // Delete lecturer
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lecturer?")) return;
    try {
      await API.delete(`/lecturers/${id}`);
      fetchLecturers();
      alert("Lecturer deleted");
    } catch (err) {
      alert("Error deleting lecturer: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Header & Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Lecturers</p>
              <h1 className="text-3xl font-semibold text-slate-950">Manage faculty details</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, or specialization"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          {/* Grid: form + table */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Add Lecturer Form */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Add a new lecturer</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email *</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    placeholder="lecturer@example.com"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    <option value="">Select department</option>

                    {departments.map((dep) => (
                      <option key={dep._id} value={dep.name}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Specialization</label>
                  <input
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Machine Learning"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Subjects (comma‑separated)</label>
                  <input
                    value={form.subjects}
                    onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                    placeholder="OOP, SE, Database"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Availability (Monday)</label>
                  <div className="grid grid-cols-2 gap-3">
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
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add lecturer
                </button>
              </div>
            </div>

            {/* Lecturers Table */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Subjects</th>
                      <th className="px-4 py-3">Availability</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          Loading lecturers...
                        </td>
                      </tr>
                    ) : visibleLecturers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          No lecturers found
                        </td>
                      </tr>
                    ) : (
                      visibleLecturers.map((lecturer) => (
                        <tr key={lecturer._id} className="transition hover:bg-slate-50">
                          {editingId === lecturer._id ? (
                            // Inline edit mode
                            <>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                {departments.map((dep) => (
                                  <option key={dep._id} value={dep.name}>
                                    {dep.name}
                                  </option>
                                ))}
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  type="email"
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.subjects}
                                  onChange={(e) => setEditForm({ ...editForm, subjects: e.target.value })}
                                  placeholder="OOP, SE"
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div className="grid grid-cols-2 gap-1">
                                  <input
                                    type="time"
                                    value={editForm.startTime}
                                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                                    className="rounded border border-slate-300 px-1 py-1 text-sm"
                                  />
                                  <input
                                    type="time"
                                    value={editForm.endTime}
                                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                                    className="rounded border border-slate-300 px-1 py-1 text-sm"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdate(lecturer._id)}
                                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View mode
                            <>
                              <td className="px-4 py-4 font-medium text-slate-900">{lecturer.name}</td>
                              <td className="px-4 py-4 text-slate-600">{lecturer.department}</td>
                              <td className="px-4 py-4 text-slate-600">{lecturer.email}</td>
                              <td className="px-4 py-4 text-slate-600">
                                {(lecturer.subjects || []).map(s => s.name).join(", ") || "—"}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {lecturer.availability && lecturer.availability.length > 0
                                  ? `${lecturer.availability[0].startTime} – ${lecturer.availability[0].endTime}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(lecturer)}
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(lecturer._id)}
                                    className="rounded-2xl border border-rose-500 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}