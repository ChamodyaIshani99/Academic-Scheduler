import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Request interceptor: attach token from localStorage automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: optional global error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // If 401, optionally clear token
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default API;