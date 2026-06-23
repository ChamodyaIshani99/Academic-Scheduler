import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";

export default function Lecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", specialization: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", specialization: "" });

  const fetchLecturers = async () => {
    try {
      const res = await API.get("/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const visibleLecturers = useMemo(() => {
    return lecturers.filter((lecturer) =>
      lecturer.name.toLowerCase().includes(search.toLowerCase()) ||
      (lecturer.specialization || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [lecturers, search]);

  const handleAdd = async () => {
    try {
      await API.post("/lecturers", form);
      setForm({ name: "", specialization: "" });
      fetchLecturers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name || "",
      specialization: item.specialization || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/lecturers/${id}`, editForm);
      setEditingId(null);
      fetchLecturers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/lecturers/${id}`);
      fetchLecturers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Lecturers</p>
              <h1 className="text-3xl font-semibold text-slate-950">Manage faculty details</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lecturers"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Add new lecturer</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <label className="block text-sm font-medium text-slate-700">Specialization</label>
                <input
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add lecturer
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleLecturers.map((lecturer) => (
                    <tr key={lecturer._id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 w-1/3">
                        {editingId === lecturer._id ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{lecturer.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 w-1/3">
                        {editingId === lecturer._id ? (
                          <input
                            value={editForm.specialization}
                            onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          <span className="text-slate-600">{lecturer.specialization || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {editingId === lecturer._id ? (
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
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(lecturer)}
                              className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(lecturer._id)}
                              className="rounded-2xl border border-rose-500 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
