// import { Navigate } from "react-router-dom";
// import { useAuth } from "../auth/AuthContext"; // ⚠️ check path

// export default function PrivateRoute({ children, permission }) {
//   const { isAuthenticated, can, loading } = useAuth();

//   if (loading) return <div>Loading...</div>;

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (permission && !can(permission)) {
//     return <Navigate to="/unauthorized" />;
//   }

//   return children;
// }


import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function PrivateRoute({ children, permission }) {
  const { isAuthenticated, can, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}