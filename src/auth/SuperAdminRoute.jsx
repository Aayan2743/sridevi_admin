// import { Navigate } from "react-router-dom";
// import { useSuperAdminAuth } from "./SuperAdminAuthContext";

// export default function SuperAdminRoute({ children }) {
//   const { isAuthenticated, loading } = useSuperAdminAuth();

//   if (loading) return <div className="p-10 text-center">Loading...</div>;

//   return isAuthenticated
//     ? children
//     : <Navigate to="/super-admin/login" />;
// }


import { Navigate } from "react-router-dom";
import { useSuperAdminAuth } from "./SuperAdminAuthContext";

export default function SuperAdminRoute({ children }) {
  const { isAuthenticated, loading } = useSuperAdminAuth();

  // ⛔ WAIT until loading finishes
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return isAuthenticated
    ? children
    : <Navigate to="/super-admin/login" />;
}