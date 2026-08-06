import api from "../lib/axios";

// Mirrors swify-server/src/routes/paymentIdentity.routes.js
// identifier can be a swifyId or a payAddress - the backend resolves either.
export const resolvePaymentUser = (identifier) =>
  api.post("/api/payment-identity/resolve", { identifier });
