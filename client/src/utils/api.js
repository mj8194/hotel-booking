import axios from "axios";

const api = axios.create({
  // Use VITE_ prefix for frontend env variables
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
});

export default api;