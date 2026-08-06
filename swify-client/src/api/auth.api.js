import api from "../lib/axios";

// Mirrors swify-server/src/routes/auth.routes.js
export const registerUser = (payload) => api.post("/api/auth/register", payload);

export const loginUser = (payload) => api.post("/api/auth/login", payload);
