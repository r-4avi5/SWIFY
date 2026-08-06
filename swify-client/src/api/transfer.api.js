import api from "../lib/axios";

// Mirrors swify-server/src/routes/transfer.routes.js
// Every money-movement call must carry the short-lived payment token that
// /api/mpin/verify hands back, in the "x-payment-authorisation" header.
export const transferMoney = ({ receiver, amount, note, paymentToken }) =>
  api.post(
    "/api/transfer",
    { receiver, amount, note },
    { headers: { "x-payment-authorisation": paymentToken } }
  );

export const transferByQR = ({ qrData, amount, note, idempotencyKey, paymentToken }) =>
  api.post(
    "/api/transfer/qr",
    { qrData, amount, note, idempotencyKey },
    { headers: { "x-payment-authorisation": paymentToken } }
  );

export const scanQR = (qrData) => api.post("/api/transfer/scan", { qrData });
