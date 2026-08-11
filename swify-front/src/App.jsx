import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
 
import { API_BASE_URL } from "./config";
 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import KYCSubmit from "./pages/KYCSubmit";
import MpinSetup from "./pages/MPINSetup";
import MpinChange from "./pages/MpinChange";
import HomePage from "./pages/HomePage";
import Send from "./pages/Send";
import Scan from "./pages/Scan";
import Request from "./pages/Request";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
 
/**
 * Guards routes that require a logged-in user. Checks the real session
 * by calling a lightweight authenticated endpoint rather than trusting
 * client state — the httpOnly cookie can't be read from JS directly,
 * so this is the only reliable way to know if the user is signed in.
 */
function RequireAuth({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"
 
  useEffect(() => {
    fetch(`${API_BASE_URL}/user/profile`, { credentials: "include" })
      .then((res) => setStatus(res.ok ? "ok" : "denied"))
      .catch(() => setStatus("denied"));
  }, []);
 
  if (status === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
 
  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }
 
  return children;
}
 
export default function App() {
  return (
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
 
        {/* Onboarding — requires login, but not necessarily completed KYC/MPIN */}
        <Route path="/kyc" element={<RequireAuth><KYCSubmit /></RequireAuth>} />
        <Route path="/mpin-setup" element={<RequireAuth><MpinSetup /></RequireAuth>} />
 
        {/* Core app — requires login */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/send" element={<RequireAuth><Send /></RequireAuth>} />
        <Route path="/scan" element={<RequireAuth><Scan /></RequireAuth>} />
        <Route path="/request" element={<RequireAuth><Request /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
        <Route
          path="/transactions/:reference"
          element={<RequireAuth><TransactionDetail /></RequireAuth>}
        />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/security/mpin" element={<RequireAuth><MpinChange /></RequireAuth>} />
 
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}