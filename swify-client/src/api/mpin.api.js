import api from "../lib/axios";

// Mirrors swify-server/src/routes/mpin.routes.js
export const createMpin = (mpin) => api.post("/api/mpin/create", { mpin });

export const verifyMpin = (mpin) => api.post("/api/mpin/verify", { mpin });

export const changeMpin = (oldMpin, newMpin) =>
  api.patch("/api/mpin/change", { oldMpin, newMpin });
