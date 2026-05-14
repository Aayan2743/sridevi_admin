import { Navigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import ProtectedRoute from "./ProtectedRoute";

export default function BrandProtectedRoute({ children }) {
  const { showBrandName } = useProfile();

  // First check the toggle
  if (!showBrandName) {
    return <Navigate to="/dashboard" replace />;
  }

  // Then check authentication
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
