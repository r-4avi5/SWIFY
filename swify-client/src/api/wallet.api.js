import api from "../config/axios";

// Mirrors swify-server/src/routes/wallet.route.js
export const getWallet = () => api.get("/api/wallet");

export const getWalletBalance = () => api.get("/api/wallet/balance");
