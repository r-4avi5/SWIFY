import axios from "axios";

// The backend (swify-server) authenticates via an httpOnly "token" cookie
// set on /api/auth/login, so every request must carry credentials.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalise error shape: swify-server always responds { success:false, message }
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject({ ...err, message });
  }
);

export default api;
