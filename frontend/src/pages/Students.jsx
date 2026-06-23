import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", regNo: "", department: "", year: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", regNo: "", department: "", year: "" });

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const visibleStudents = useMemo(() => {
    return students.filter((student) =>
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (student.regNo || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const handleAdd = async () => {
    try {
      if (!form.name) {
        alert("Student name is required");
        return;
      }
      await API.post("/students", {
        name: form.name,
        email: form.email || undefined,
        regNo: form.regNo || undefined,
        department: form.department || undefined,
        year: form.year ? Number(form.year) : undefined
      });
      setForm({ name: "", email: "", regNo: "", department: "", year: "" });
      fetchStudents();
      alert("Student added successfully");
    } catch (err) {
      alert("Error adding student: " + err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name || "",
      email: item.email || "",
      regNo: item.regNo || "",
      department: item.department || "",
      year: item.year?.toString() || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      if (!editForm.name) {
        alert("Student name is required");
        return;
      }
      await API.put(`/students/${id}`, {
        name: editForm.name,
        email: editForm.email || undefined,
        regNo: editForm.regNo || undefined,
        department: editForm.department || undefined,
        year: editForm.year ? Number(editForm.year) : undefined
      });
      setEditingId(null);
      fetchStudents();
      alert("Student updated successfully");
    } catch (err) {
      alert("Error updating student: " + err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
      alert("Student deleted");
    } catch (err) {
      alert("Error deleting student: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Students</p>
              <h1 className="text-3xl font-semibold text-slate-950">Manage individual students</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Add a new student</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Student name"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    placeholder="student@example.com"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Registration No</label>
                  <input
                    value={form.regNo}
                    onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                    placeholder="Reg #"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Department"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Year</label>
                  <input
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    type="number"
                    placeholder="Year"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add student
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Reg No</th>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visibleStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      visibleStudents.map((student) => (
                        <tr key={student._id} className="transition hover:bg-slate-50">
                          {editingId === student._id ? (
                            <>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
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
                                  value={editForm.regNo}
                                  onChange={(e) => setEditForm({ ...editForm, regNo: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.year}
                                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                  type="number"
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdate(student._id)}
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
                            <>
                              <td className="px-4 py-4 font-medium text-slate-900">{student.name}</td>
                              <td className="px-4 py-4 text-slate-600">{student.email || "—"}</td>
                              <td className="px-4 py-4 text-slate-600">{student.regNo || "—"}</td>
                              <td className="px-4 py-4 text-slate-600">{student.year || "—"}</td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(student)}
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(student._id)}
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
