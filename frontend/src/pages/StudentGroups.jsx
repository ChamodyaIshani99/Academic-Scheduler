import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";
import { Plus, Trash2, Edit2, Search, Users, Eye } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function StudentGroups() {
  const auth = useAuth();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Form states for creating a new group
  const [form, setForm] = useState({
    groupName: "",
    groupId: "",
    description: "",
    department: "",
    year: "",
    maxSize: "",
  });

  // Inline editing states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    groupName: "",
    groupId: "",
    description: "",
    department: "",
    year: "",
    maxSize: "",
  });

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewGroup, setViewGroup] = useState(null);

  // Fetch groups and students (only if admin)
  useEffect(() => {
    if (auth.user?.role === "Admin") {
      fetchGroups();
      fetchStudents();
    }
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student-groups");
      setGroups(res.data);
    } catch (err) {
      alert("Error fetching groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Filter groups based on search
  const visibleGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        (g.groupName || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.groupId || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  // Create group
  const handleCreate = async () => {
    try {
      if (!form.groupName || !form.groupId) {
        alert("Group Name and Group ID are required");
        return;
      }
      await API.post("/student-groups", {
        groupName: form.groupName,
        groupId: form.groupId,
        description: form.description || undefined,
        department: form.department || undefined,
        year: form.year ? Number(form.year) : undefined,
        maxSize: form.maxSize ? Number(form.maxSize) : undefined,
      });
      setForm({
        groupName: "",
        groupId: "",
        description: "",
        department: "",
        year: "",
        maxSize: "",
      });
      fetchGroups();
      alert("Group created successfully");
    } catch (err) {
      alert("Error creating group: " + err.response?.data?.message || err.message);
    }
  };

  // Delete group
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await API.delete(`/student-groups/${id}`);
      fetchGroups();
      alert("Group deleted");
    } catch (err) {
      alert("Error deleting group: " + err.message);
    }
  };

  // Start inline editing
  const handleEdit = (group) => {
    setEditingId(group._id);
    setEditForm({
      groupName: group.groupName || "",
      groupId: group.groupId || "",
      description: group.description || "",
      department: group.department || "",
      year: group.year?.toString() || "",
      maxSize: group.maxSize?.toString() || "",
    });
  };

  // Update group
  const handleUpdate = async (id) => {
    try {
      if (!editForm.groupName || !editForm.groupId) {
        alert("Group Name and Group ID are required");
        return;
      }
      await API.put(`/student-groups/${id}`, {
        groupName: editForm.groupName,
        groupId: editForm.groupId,
        description: editForm.description || undefined,
        department: editForm.department || undefined,
        year: editForm.year ? Number(editForm.year) : undefined,
        maxSize: editForm.maxSize ? Number(editForm.maxSize) : undefined,
      });
      setEditingId(null);
      fetchGroups();
      alert("Group updated successfully");
    } catch (err) {
      alert("Error updating group: " + err.response?.data?.message || err.message);
    }
  };

  // Add student to group
  const handleAddStudent = async () => {
    if (!selectedStudent) {
      alert("Select a student");
      return;
    }
    // Optional client-side check: if student already in group, inform and return
    const studentObj = students.find(s => s._id === selectedStudent);
    if (studentObj && selectedGroup.students.some(s => s._id === selectedStudent)) {
      alert("This student is already in the group");
      return;
    }
    try {
      await API.post(`/student-groups/${selectedGroup._id}/add-student`, {
        studentId: selectedStudent,
      });
      setSelectedStudent("");
      setShowAddStudentModal(false);
      fetchGroups();
      alert("Student added to group");
    } catch (err) {
      alert("Error adding student: " + err.response?.data?.message || err.message);
    }
  };

  // Remove student from group (used in view modal)
  const handleRemoveStudent = async (groupId, studentId) => {
    if (!window.confirm("Remove student from group?")) return;
    try {
      await API.post(`/student-groups/${groupId}/remove-student`, {
        studentId,
      });
      await fetchGroups();
      // Refresh view group data
      const freshGroup = groups.find((g) => g._id === groupId);
      if (freshGroup) setViewGroup(freshGroup);
      alert("Student removed from group");
    } catch (err) {
      alert("Error removing student: " + err.message);
    }
  };

  // Open view modal
  const handleView = (group) => {
    setViewGroup(group);
    setShowViewModal(true);
  };

  // Permission check
  if (auth.user?.role !== "Admin") {
    return (
      <Layout>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-red-600 shadow-sm">
          <p>Only admins can manage student groups</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Header & Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Groups</p>
              <h1 className="text-3xl font-semibold text-slate-950">Manage student groups</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          {/* Grid: form + table */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Create group form */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Create a new group</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Group Name *</label>
                  <input
                    value={form.groupName}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                    placeholder="e.g. Group A"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Group ID *</label>
                  <input
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                    placeholder="e.g. G-001"
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description"
                    rows="2"
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
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Max Size</label>
                    <input
                      value={form.maxSize}
                      onChange={(e) => setForm({ ...form, maxSize: e.target.value })}
                      type="number"
                      placeholder="Limit"
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Create group
                </button>
              </div>
            </div>

            {/* Groups table */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-4 py-3">Group Name</th>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Year</th>
                      <th className="px-4 py-3">Max</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                          Loading groups...
                        </td>
                      </tr>
                    ) : visibleGroups.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                          No groups found
                        </td>
                      </tr>
                    ) : (
                      visibleGroups.map((group) => (
                        <tr key={group._id} className="transition hover:bg-slate-50">
                          {editingId === group._id ? (
                            // Inline edit mode
                            <>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.groupName}
                                  onChange={(e) => setEditForm({ ...editForm, groupName: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.groupId}
                                  onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.department}
                                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
                              <td className="px-4 py-4">
                                <input
                                  value={editForm.maxSize}
                                  onChange={(e) => setEditForm({ ...editForm, maxSize: e.target.value })}
                                  type="number"
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                  <Users size={14} /> {group.students?.length || 0}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdate(group._id)}
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
                              <td className="px-4 py-4 font-medium text-slate-900">{group.groupName}</td>
                              <td className="px-4 py-4 text-slate-600">{group.groupId}</td>
                              <td className="px-4 py-4 text-slate-600">{group.department || "—"}</td>
                              <td className="px-4 py-4 text-slate-600">{group.year || "—"}</td>
                              <td className="px-4 py-4 text-slate-600">{group.maxSize || "—"}</td>
                              <td className="px-4 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                  <Users size={14} /> {group.students?.length || 0}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleView(group)}
                                    className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 flex items-center gap-1"
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedGroup(group);
                                      setShowAddStudentModal(true);
                                    }}
                                    className="rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 flex items-center gap-1"
                                  >
                                    <Plus size={14} /> Add
                                  </button>
                                  <button
                                    onClick={() => handleEdit(group)}
                                    className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1"
                                  >
                                    <Edit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(group._id)}
                                    className="rounded-2xl border border-rose-500 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
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

      {/* View Group Modal */}
      {showViewModal && viewGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-semibold text-slate-900">{viewGroup.groupName}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Group ID</p>
                <p className="font-medium text-slate-900">{viewGroup.groupId}</p>
              </div>
              <div>
                <p className="text-slate-500">Department</p>
                <p className="font-medium text-slate-900">{viewGroup.department || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Year</p>
                <p className="font-medium text-slate-900">{viewGroup.year || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Max Size</p>
                <p className="font-medium text-slate-900">{viewGroup.maxSize || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Description</p>
                <p className="font-medium text-slate-900">{viewGroup.description || "No description"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Members</p>
                <p className="font-medium text-slate-900">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    <Users size={14} /> {viewGroup.students?.length || 0}
                  </span>
                </p>
              </div>
            </div>

            {/* Students list */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700">Student List</h3>
              {viewGroup.students && viewGroup.students.length > 0 ? (
                <ul className="mt-2 divide-y divide-slate-200 border rounded-2xl overflow-hidden">
                  {viewGroup.students.map((student) => (
                    <li key={student._id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.regNo || "No ID"} • {student.email || "No email"}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(viewGroup._id, student._id)}
                        className="rounded-2xl border border-rose-500 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No students in this group.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal – shows ALL students, disables those already in group */}
      {showAddStudentModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Add Student to {selectedGroup.groupName}
            </h2>
            <p className="text-sm text-slate-500">Select a student to add to this group</p>
            <div className="mt-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-300"
              >
                <option value="">— Select a student —</option>
                {students.map((s) => {
                  const isInGroup = selectedGroup.students.some(st => st._id === s._id);
                  return (
                    <option
                      key={s._id}
                      value={s._id}
                      disabled={isInGroup}
                      className={isInGroup ? "text-slate-400" : ""}
                    >
                      {s.name} ({s.regNo || "No ID"}) {isInGroup ? "— already in group" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddStudent}
                className="flex-1 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSelectedStudent("");
                }}
                className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}