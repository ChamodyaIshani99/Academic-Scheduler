import { useState, useEffect } from "react";
import axios from "../api/api";
import { Plus, Trash2, Users, Edit2, Search } from "lucide-react";
import useAuth from "../hooks/useAuth";

const StudentGroups = () => {
  const auth = useAuth();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    groupName: "",
    groupId: "",
    description: "",
    department: "",
    year: "",
    maxSize: ""
  });

  const [selectedStudent, setSelectedStudent] = useState("");

  // Fetch groups
  useEffect(() => {
    fetchGroups();
    if (auth.user?.role === "Admin") {
      fetchStudents();
    }
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/student-groups");
      setGroups(res.data);
    } catch (err) {
      alert("Error fetching groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/student-groups", formData);
      setFormData({
        groupName: "",
        groupId: "",
        description: "",
        department: "",
        year: "",
        maxSize: ""
      });
      setShowCreateForm(false);
      fetchGroups();
      alert("Group created successfully");
    } catch (err) {
      alert("Error creating group: " + err.response?.data?.message || err.message);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      await axios.delete(`/student-groups/${id}`);
      fetchGroups();
      alert("Group deleted");
    } catch (err) {
      alert("Error deleting group: " + err.message);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      alert("Select a student");
      return;
    }
    try {
      await axios.post(`/student-groups/${selectedGroup._id}/add-student`, {
        studentId: selectedStudent
      });
      setSelectedStudent("");
      setShowAddStudentModal(false);
      fetchGroups();
      alert("Student added to group");
    } catch (err) {
      alert("Error adding student: " + err.response?.data?.message || err.message);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove student from group?")) return;
    try {
      await axios.post(`/student-groups/${selectedGroup._id}/remove-student`, {
        studentId
      });
      fetchGroups();
      alert("Student removed from group");
    } catch (err) {
      alert("Error removing student: " + err.message);
    }
  };

  const filteredGroups = groups.filter(g =>
    (g.groupName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.groupId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (auth.user?.role !== "Admin") {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Only admins can manage student groups</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Groups</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> New Group
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Create Student Group</h2>
            <form onSubmit={handleCreateGroup} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Group Name"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Group ID"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border rounded px-3 py-2 col-span-2"
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Max Size"
                value={formData.maxSize}
                onChange={(e) => setFormData({ ...formData, maxSize: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by group name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <p>Loading groups...</p>
        ) : filteredGroups.length === 0 ? (
          <p className="text-gray-600">No groups found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Group Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{group.groupName}</h3>
                  <p className="text-sm text-gray-600">ID: {group.groupId}</p>
                  {group.description && (
                    <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                  )}
                </div>

                {/* Group Info */}
                <div className="text-sm text-gray-700 mb-4 space-y-1">
                  {group.department && <p>Department: {group.department}</p>}
                  {group.year && <p>Year: {group.year}</p>}
                  {group.maxSize > 0 && <p>Max Size: {group.maxSize}</p>}
                </div>

                {/* Students Count */}
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Users size={16} />
                    Members: {group.size || 0}
                  </p>
                </div>

                {/* Students List */}
                {group.students && group.students.length > 0 && (
                  <div className="mb-4 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Students:</p>
                    <div className="space-y-1">
                      {group.students.map((student) => (
                        <div
                          key={student._id}
                          className="flex justify-between items-center text-xs bg-gray-100 p-2 rounded"
                        >
                          <span>{student.name}</span>
                          <button
                            onClick={() => {
                              setSelectedGroup(group);
                              handleRemoveStudent(student._id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowAddStudentModal(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> Add Student
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                Add Student to {selectedGroup.groupName}
              </h2>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="">-- Select a student --</option>
                {students
                  .filter(s => !s.groupId) // Only show unassigned students
                  .map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.regNo || "No ID"})
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStudent}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setSelectedStudent("");
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroups;
