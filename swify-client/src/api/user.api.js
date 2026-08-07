import api from "../config/axios";

// Mirrors swify-server/src/routes/user.routes.js
export const getProfile = () => api.get("/api/user/profile");
