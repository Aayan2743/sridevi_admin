


import { createContext, useContext, useState, useEffect } from "react";

const SuperAdminAuthContext = createContext();

export function SuperAdminAuthProvider({ children }) {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Load from localStorage (token + user)
  useEffect(() => {
    const user = localStorage.getItem("super_admin_user");
    const token = localStorage.getItem("super_admin_token");

    if (user && token) {
      setSuperAdmin(JSON.parse(user));
    }

    setLoading(false);
  }, []);

  // 🔐 Login (API based)
  const login = ({ user, token }) => {
    localStorage.setItem("super_admin_user", JSON.stringify(user));
    localStorage.setItem("super_admin_token", token);

    setSuperAdmin(user);
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("super_admin_user");
    localStorage.removeItem("super_admin_token");

    setSuperAdmin(null);

    // redirect
    window.location.href = "/super-admin/login";
  };

  return (
    <SuperAdminAuthContext.Provider
      value={{
        superAdmin,
        login,
        logout,
        loading,
        isAuthenticated: !!superAdmin,
      }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

// Hook
export const useSuperAdminAuth = () =>
  useContext(SuperAdminAuthContext);