import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to Academic Scheduler</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <div className="rounded-md bg-rose-50 p-3 text-rose-700">{error}</div>}

            <label className="block text-sm text-slate-700">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none"
              />
            </div>

            <label className="block text-sm text-slate-700">Password</label>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-3xl bg-slate-950 px-4 py-2 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-500">
            Need an account? <Link to="/" className="text-slate-900 underline">Contact admin</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
