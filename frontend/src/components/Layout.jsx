import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
