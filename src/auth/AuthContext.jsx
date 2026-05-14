


import { createContext, useContext, useState, useEffect, useMemo } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]); // 🔥 ADD THIS
  const [loading, setLoading] = useState(true);

  const safeJsonParse = (value, fallback) => {
    if (value == null) return fallback;
    if (value === "undefined" || value === "null" || value === "") return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedPermissions = localStorage.getItem("permissions");

    if (token && storedUser) {
      const parsedUser = safeJsonParse(storedUser, null);
      if (parsedUser) setUser(parsedUser);
      else localStorage.removeItem("user");
    }

    if (storedPermissions) {
      const parsedPermissions = safeJsonParse(storedPermissions, []);
      if (Array.isArray(parsedPermissions)) setPermissions(parsedPermissions); // 🔥 LOAD
      else {
        setPermissions([]);
        localStorage.removeItem("permissions");
      }
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */
  const login = async (username, password) => {
    const res = await api.post("/auth/admin-login", {
      username,
      password,
    });

    if (res.data.success) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem(
        "permissions",
        JSON.stringify(res.data.permissions)
      );

      setUser(res.data.user);
      setPermissions(res.data.permissions); // 🔥 SET STATE

      return true;
    }

    return false;
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions"); // 🔥 ADD THIS

    setUser(null);
    setPermissions([]);
  };

  /* ================= HELPER ================= */
  const can = (permission) => {
    return (
      permissions.includes("*") || permissions.includes(permission)
    );
  };


  const refreshPermissions = async () => {
  try {
    const res = await api.get("/admin-dashboard/my-permissions");

    localStorage.setItem(
      "permissions",
      JSON.stringify(res.data.permissions)
    );

    setPermissions(res.data.permissions);
  } catch (e) {
    console.error(e);
  }
};

const refreshUser = async () => {
  try {
    const res = await api.get("/auth/me");

    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  } catch (e) {
    console.error(e);
  }
};


useEffect(() => {
  const handleFocus = () => {
    console.log("User returned → refreshing permissions...");
    refreshPermissions();
  };

  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("focus", handleFocus);
  };
}, []);

  /* ================= VALUE ================= */
  const value = useMemo(() => {
    return {
      user,
      permissions,
      refreshPermissions,
       refreshUser,
      can, // 🔥 VERY IMPORTANT
      isAuthenticated: !!user,
      login,
      logout,
      loading,
    };
  }, [user, permissions, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);