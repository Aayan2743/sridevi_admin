



import { Shield, Lock } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSuperAdminAuth } from "../auth/SuperAdminAuthContext";

import api from "../api/axios";// ✅ your interceptor axios
import toast from "react-hot-toast";

export default function SuperAdminLoginUI() {

    const [loading, setLoading] = useState(false);


  const [form, setForm] = useState({
    username: "",
    password: "",
  });



    const navigate = useNavigate();
  const { login, isAuthenticated } = useSuperAdminAuth(); // ✅ HERE

    if (isAuthenticated) {
    return <Navigate to="/super-admin" />;
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.username || !form.password) {
    toast.error("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const res = await api.post("/auth/super-admin-login", {
      username: form.username,
      password: form.password,
    });

    if (res.data.success) {
      // ✅ save via context
      login({
        user: res.data.user,
        token: res.data.token,
      });

      toast.success("Login successful 🚀");

      navigate("/super-admin");
    } else {
      toast.error(res.data.message);
    }

  } catch (err) {
    console.log(err);

    // interceptor already handles 401/422
    if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Login failed");
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white p-10">
        
        <div className="mb-6">
          <Shield size={60} className="text-purple-400" />
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Super Admin Access
        </h1>

        <p className="text-gray-300 text-center max-w-md">
          Full control over system operations, users, and permissions. 
          This panel is restricted to authorized personnel only.
        </p>

        <div className="mt-10 text-sm text-gray-400">
          🔐 Secure • Private • Powerful
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center bg-gray-950 px-6">
        
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-6">
            <Lock className="mx-auto text-purple-400 mb-2" size={32} />
            <h2 className="text-2xl font-bold text-white">
              Login
            </h2>
            <p className="text-gray-400 text-sm">
              Super Admin Panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="text-gray-400 text-sm">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:opacity-90 transition"
            >
              Sign In as Super Admin
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Authorized access only
          </p>
        </div>
      </div>
    </div>
  );
}