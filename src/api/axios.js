



import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 🔐 REQUEST → attach correct token
api.interceptors.request.use(
  (config) => {
    const path = window.location.pathname;

    // ✅ detect which panel
    let token = null;

    if (path.startsWith("/super-admin")) {
      token = localStorage.getItem("super_admin_token");
    } else {
      token = localStorage.getItem("token"); // admin token
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE → handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location.pathname;

    // ================= SUPER ADMIN =================
    if (path.startsWith("/super-admin")) {
      const token = localStorage.getItem("super_admin_token");

      if (status === 401 && token) {
        localStorage.removeItem("super_admin_token");
        localStorage.removeItem("super_admin_user");

        alert("Super Admin session expired");

        window.location.href = "/super-admin/login";
      }
    }

    // ================= ADMIN =================
    else {
      const token = localStorage.getItem("token");

      if (status === 401 && token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("Session expired. Please login again.");

        window.location.href = "/login";
      }
    }

    // 🔥 VALIDATION ERROR
    if (status === 422) {
      alert(error.response.data.message);
    }

    return Promise.reject(error);
  }
);

export default api;