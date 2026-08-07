import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetail from "./pages/TransactionDetail";
import Kyc from "./pages/Kyc";
import Mpin from "./pages/Mpin";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/transactions/:reference" element={<TransactionDetail />} />
              <Route path="/kyc" element={<Kyc />} />
              <Route path="/mpin" element={<Mpin />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
