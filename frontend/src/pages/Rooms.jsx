import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/api";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ roomName: "", type: "", capacity: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ roomName: "", type: "", capacity: "" });

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const visibleRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      (room.type || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [rooms, search]);

  const handleAdd = async () => {
    try {
      await API.post("/rooms", {
        roomName: form.roomName,
        type: form.type,
        capacity: Number(form.capacity)
      });
      setForm({ roomName: "", type: "", capacity: "" });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setEditForm({
      roomName: room.roomName || "",
      type: room.type || "",
      capacity: room.capacity?.toString() || ""
    });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/rooms/${id}`, {
        roomName: editForm.roomName,
        type: editForm.type,
        capacity: Number(editForm.capacity)
      });
      setEditingId(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/rooms/${id}`);
      fetchRooms();
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
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Rooms</p>
              <h1 className="text-3xl font-semibold text-slate-950">Classroom inventory</h1>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms"
              className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Add a new room</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">Room name</label>
                <input
                  value={form.roomName}
                  onChange={(e) => setForm({ ...form, roomName: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <label className="block text-sm font-medium text-slate-700">Capacity</label>
                <input
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  type="number"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-300"
                />
                <button
                  onClick={handleAdd}
                  className="w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add room
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleRooms.map((room) => (
                    <tr key={room._id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {editingId === room._id ? (
                          <input
                            value={editForm.roomName}
                            onChange={(e) => setEditForm({ ...editForm, roomName: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          room.roomName
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600 w-36">
                        {editingId === room._id ? (
                          <input
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          room.type || "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600 w-32">
                        {editingId === room._id ? (
                          <input
                            value={editForm.capacity}
                            onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                            type="number"
                            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          room.capacity || "—"
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {editingId === room._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(room._id)}
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
                              onClick={() => handleEdit(room)}
                              className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(room._id)}
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
