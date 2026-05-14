// pages/login/Login2.jsx
// import { Eye, EyeOff } from "lucide-react";
// import { useState } from "react";
// import { useLogin } from "../hooks/useLogin";
// import { useAppSettings } from "../context/AppSettingsContext";
// import defaultimage from "../assets/profile.jpg";

// pages/login/Login2.jsx
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useAppSettings } from "../context/AppSettingsContext";
import defaultimage from "../assets/profile.jpg";

export default function Login2() {
  const {
    loginValue,
    setLoginValue,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  const { settings } = useAppSettings();
  const [showPassword, setShowPassword] = useState(false);

  const logo =
    settings?.logo && settings.logo.trim() !== ""
      ? settings.logo
      : defaultimage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} className="h-16 object-contain drop-shadow-md" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Login to continue to your dashboard
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Email or Phone"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Extra row */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="accent-purple-600" />
              Remember me
            </label>

            <span className="text-purple-600 cursor-pointer hover:underline">
              Forgot?
            </span>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Your Company
        </p>
      </div>
    </div>
  );
}
