import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import { Plus, Trash2, Edit2, Search } from "lucide-react";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Create form
  const [form, setForm] = useState({ name: "" });

  // Inline editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      alert("Error fetching departments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments by name
  const visibleDepartments = useMemo(() => {
    return departments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  // Create department
  const handleAdd = async () => {
    try {
      if (!form.name.trim()) {
        alert("Department name is required");
        return;
      }
      await API.post("/departments", { name: form.name.trim() });
      setForm({ name: "" });
      fetchDepartments();
      alert("Department added successfully");
    } catch (err) {
      alert("Error adding department: " + err.response?.data?.message || err.message);
    }
  };

  // Start editing
  const handleEdit = (dept) => {
    setEditingId(dept._id);
    setEditForm({ name: dept.name });
  };

  // Update department
  const handleUpdate = async (id) => {
    try {
      if (!editForm.name.trim()) {
        alert("Department name is required");
        return;
      }
      await API.put(`/departments/${id}`, { name: editForm.name.trim() });
      setEditingId(null);
      fetchDepartments();
      alert("Department updated successfully");
    } catch (err) {
      alert("Error updating department: " + err.response?.data?.message || err.message);
    }
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await API.delete(`/departments/${id}`);
      fetchDepartments();
      alert("Department deleted");
    } catch (err) {
      alert("Error deleting department: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Header & Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Departments</p>
              <h1 className="text-3xl font-semibold text-slate-950">Manage academic departments</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by department name"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          {/* Grid: form + table */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Add Department Form */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Add a new department</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add department
                </button>
              </div>
            </div>

            {/* Departments Table */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-4 py-3">Department Name</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-slate-500">
                          Loading departments...
                        </td>
                      </tr>
                    ) : visibleDepartments.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-slate-500">
                          No departments found
                        </td>
                      </tr>
                    ) : (
                      visibleDepartments.map((dept) => (
                        <tr key={dept._id} className="transition hover:bg-slate-50">
                          {editingId === dept._id ? (
                            // Inline edit mode
                            <>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdate(dept._id)}
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
                              <td className="px-4 py-4 font-medium text-slate-900">{dept.name}</td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEdit(dept)}
                                    className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(dept._id)}
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