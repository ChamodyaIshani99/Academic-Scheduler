import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, roles }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-slate-700" />
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const role = auth.user.role || auth.user?.roleName || auth.user?.roles?.[0];
    if (!roles.includes(role)) {
      return (
        <div className="p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">Unauthorized</h2>
            <p className="mt-2 text-sm">You don’t have permission to view this page.</p>
          </div>
        </div>
      );
    }
  }

  return children;
}
