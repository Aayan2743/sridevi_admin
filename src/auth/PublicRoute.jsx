// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// export default function PublicRoute({ children }) {
//   const { isAuthenticated } = useAuth();

//   return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
// }

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}
