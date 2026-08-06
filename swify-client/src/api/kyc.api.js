import api from "../lib/axios";

// Mirrors swify-server/src/routes/kyc.routes.js
// documents are as strings (data URLs) - the backend model just stores
// whatever string it's given for aadharFront / aadharBack / panCard / selfie.
export const submitKYC = (payload) => api.post("/api/kyc/submit", payload );

export default api;
