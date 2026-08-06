import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/auth.api";
import { getProfile } from "../api/user.api";
import { connectSocket, disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);

// The backend hands the session out two ways at once: an httpOnly cookie
// (used automatically by axios) and the raw JWT in the login response body
// (needed client-side only to authenticate the socket.io handshake).
const SOCKET_TOKEN_KEY = "swify.socketToken";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking"); // checking | authed | guest
  const [error, setError] = useState("");

  const bootSocket = useCallback((token) => {
    if (token) sessionStorage.setItem(SOCKET_TOKEN_KEY, token);
    const savedToken = token || sessionStorage.getItem(SOCKET_TOKEN_KEY);
    if (savedToken) connectSocket(savedToken);
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const res = await getProfile();
      setUser(res.data.data);
      setStatus("authed");
      bootSocket();
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }, [bootSocket]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (credentials) => {
    setError("");
    const res = await loginUser(credentials);
    const { user: loggedInUser, token } = res.data.data;
    setUser(loggedInUser);
    setStatus("authed");
    bootSocket(token);
    return loggedInUser;
  }, [bootSocket]);

  const register = useCallback(async (payload) => {
    setError("");
    const res = await registerUser(payload);
    return res.data.data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStatus("guest");
    sessionStorage.removeItem(SOCKET_TOKEN_KEY);
    disconnectSocket();
    // swify-server has no /logout route yet; clearing local state + the
    // socket connection is what we can do from here.
  }, []);

  const value = useMemo(
    () => ({ user, setUser, status, error, setError, login, register, logout }),
    [user, status, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
