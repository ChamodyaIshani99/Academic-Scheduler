import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../api/api";

const stats = [
  { key: "students", label: "Student groups", tone: "bg-sky-500/10 text-sky-700" },
  { key: "lecturers", label: "Lecturers", tone: "bg-emerald-500/10 text-emerald-700" },
  { key: "subjects", label: "Subjects", tone: "bg-violet-500/10 text-violet-700" },
  { key: "rooms", label: "Rooms", tone: "bg-amber-500/10 text-amber-700" },
  { key: "timetable", label: "Timetable entries", tone: "bg-fuchsia-500/10 text-fuchsia-700" }
];

export default function Dashboard() {
  const [counts, setCounts] = useState({ students: 0, lecturers: 0, subjects: 0, rooms: 0, timetable: 0 });
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [students, lecturers, subjects, rooms, timetable] = await Promise.all([
          API.get("/students"),
          API.get("/lecturers"),
          API.get("/subjects"),
          API.get("/rooms"),
          API.get("/timetable")
        ]);

        setCounts({
          students: students.data.length,
          lecturers: lecturers.data.length,
          subjects: subjects.data.length,
          rooms: rooms.data.length,
          timetable: timetable.data.length
        });
        setLatest(timetable.data.slice(-5).reverse());
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
              <h1 className="text-3xl font-semibold text-slate-950">Academic schedule overview</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Professional UI for modern scheduling workflows.
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <Link
                key={stat.key}
                to={stat.key === "timetable" ? "/timetable" : `/${stat.key}`}
                className={`rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${stat.tone}`}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                <p className="mt-4 text-4xl font-semibold text-slate-950">{counts[stat.key]}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Recent timetable rows</h2>
              <p className="text-sm text-slate-500">Latest generated schedule entries provide a quick summary of bookings.</p>
            </div>
            <Link
              to="/timetable"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View timetable
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {latest.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No timetable entries are available yet.
              </div>
            ) : (
              latest.map((row) => (
                <div key={row._id} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[1fr_2fr]">
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{row.day}</p>
                    <p className="text-xl font-semibold text-slate-950">{row.startTime} - {row.endTime}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                      <p className="text-slate-500">Group</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.groupId?.groupId || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                      <p className="text-slate-500">Subject</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.subjectId?.name || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                      <p className="text-slate-500">Room</p>
                      <p className="mt-2 font-semibold text-slate-900">{row.roomId?.roomName || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
