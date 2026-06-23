import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      const decoded = decodeToken(t);
      setUser(decoded || null);
      API.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const t = res.data.token || res.data?.accessToken || null;
      if (!t) throw new Error("No token received from server");
      localStorage.setItem("token", t);
      API.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      const decoded = decodeToken(t);
      setToken(t);
      setUser(decoded || null);
      setLoading(false);
      navigate("/");
      return { ok: true };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
