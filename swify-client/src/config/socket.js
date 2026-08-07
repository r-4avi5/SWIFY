import { io } from "socket.io-client";

// Mirrors swify-server/src/socket/socket.js — the server verifies a raw JWT
// off socket.handshake.auth.token (not the cookie), so callers must pass the
// token that /api/auth/login returns in its response body.
let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
