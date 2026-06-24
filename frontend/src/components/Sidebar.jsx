import { Link, useLocation } from "react-router-dom";
import { Home, Users, BookOpen, Building, CalendarDays } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/", icon: Home },
  { label: "Students", to: "/students", icon: Users },
  { label: "Student Groups", to: "/student-groups", icon: Users },
  { label: "Departments", to: "/departments", icon: Building },
  { label: "Lecturers", to: "/lecturers", icon: BookOpen },
  { label: "Rooms", to: "/rooms", icon: Building },
  { label: "Subjects", to: "/subjects", icon: BookOpen },
  { label: "Timetable", to: "/timetable", icon: CalendarDays }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-slate-200 shadow-xl">
      <div className="flex flex-col h-full p-6">
        <div className="mb-10">
          <div className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-400">Academic Scheduler</div>
          <div className="text-2xl font-semibold text-white">Schedule Manager</div>
        </div>

        <div className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-slate-800 text-white shadow" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-300">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Need help?</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Use the timetable page to generate schedules automatically and manage classroom allocations across all entities.
          </p>
        </div>
      </div>
    </aside>
  );
}
