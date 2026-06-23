import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", hoursPerWeek: "2", lecturerId: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", hoursPerWeek: "2", lecturerId: "" });

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await API.get("/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchLecturers();
  }, []);

  const visibleSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(search.toLowerCase()) ||
      subject.lecturerId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [subjects, search]);

  const handleAdd = async () => {
    try {
      await API.post("/subjects", {
        name: form.name,
        hoursPerWeek: Number(form.hoursPerWeek),
        lecturerId: form.lecturerId || undefined
      });
      setForm({ name: "", hoursPerWeek: "2", lecturerId: "" });
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name || "",
      hoursPerWeek: item.hoursPerWeek?.toString() || "2",
      lecturerId: item.lecturerId?._id || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/subjects/${id}`, {
        name: editForm.name,
        hoursPerWeek: Number(editForm.hoursPerWeek),
        lecturerId: editForm.lecturerId || undefined
      });
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      fetchSubjects();
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
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Subjects</p>
              <h1 className="text-3xl font-semibold text-slate-950">Build subject schedules</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Create a new subject</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <label className="block text-sm font-medium text-slate-700">Hours per week</label>
                <input
                  value={form.hoursPerWeek}
                  onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value })}
                  type="number"
                  min="1"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <label className="block text-sm font-medium text-slate-700">Lecturer</label>
                <select
                  value={form.lecturerId}
                  onChange={(e) => setForm({ ...form, lecturerId: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                >
                  <option value="">Assign lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add subject
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Lecturer</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleSubjects.map((subject) => (
                    <tr key={subject._id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {editingId === subject._id ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          subject.name
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600 w-24">
                        {editingId === subject._id ? (
                          <input
                            value={editForm.hoursPerWeek}
                            onChange={(e) => setEditForm({ ...editForm, hoursPerWeek: e.target.value })}
                            type="number"
                            min="1"
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          subject.hoursPerWeek || "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {editingId === subject._id ? (
                          <select
                            value={editForm.lecturerId}
                            onChange={(e) => setEditForm({ ...editForm, lecturerId: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          >
                            <option value="">Assign lecturer</option>
                            {lecturers.map((lecturer) => (
                              <option key={lecturer._id} value={lecturer._id}>
                                {lecturer.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          subject.lecturerId?.name || "Unassigned"
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {editingId === subject._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(subject._id)}
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
                              onClick={() => handleEdit(subject)}
                              className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subject._id)}
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
