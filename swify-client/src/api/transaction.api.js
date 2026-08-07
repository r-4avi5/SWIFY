import api from "../config/axios";

// Mirrors swify-server/src/routes/transaction.routes.js
export const getTransactionHistory = (page = 1, limit = 20) =>
  api.get("/api/transactions", { params: { page, limit } });

export const getTransactionByReference = (reference) =>
  api.get(`/api/transactions/${reference}`);
