import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth();

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }

// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) return null;

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// }



export default function PrivateRoute({ children, permission }) {
  const { isAuthenticated, can, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // ❌ REMOVE redirect
  if (permission && !can(permission)) {
    return children; // allow render
  }

  return children;
}