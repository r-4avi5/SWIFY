import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Transfer from "./pages/transfer/Transfer";
import TransactionHistory from "./pages/transactions/TransactionHistory";
import TransactionDetail from "./pages/transactions/TransactionDetail";
import Kyc from "./pages/kyc/Kyc";
import Mpin from "./pages/mpin/Mpin";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";

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
