import { Bell, Settings, LogOut } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const auth = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-900">Welcome back</p>
          <p className="text-sm text-slate-500">Manage classrooms, subjects, lecturers, and generate timetables with confidence.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100">
            <Settings className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">{auth.user?.name?.[0] || "A"}</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{auth.user?.name || auth.user?.email || "User"}</div>
              <div className="text-xs text-slate-500">{auth.user?.role || "Member"}</div>
            </div>
          </div>
          {auth.user && (
            <button onClick={auth.logout} title="Sign out" className="ml-3 rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-rose-50">
              <LogOut className="h-4 w-4 text-rose-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
