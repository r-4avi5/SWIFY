import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children }) {
  const { status } = useAuth();

  if (status === "checking") return <Loader full />;
  if (status === "guest") return <Navigate to="/login" replace />;
  return children;
}
