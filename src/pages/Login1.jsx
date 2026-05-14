import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAppSettings } from "../context/AppSettingsContext";
import defaultimage from "../assets/profile.jpg";

const FALLBACK_LOGO = defaultimage;

export default function Login1() {
  const { settings } = useAppSettings();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const logo =
    settings?.logo && settings.logo.trim() !== ""
      ? settings.logo
      : FALLBACK_LOGO;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginValue.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const success = await login(loginValue.trim(), password.trim());
      if (success) navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end bg-cover bg-center relative"
      style={{ backgroundImage: "url('./logo/loginbanner.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md mr-0 md:mr-12 p-8 rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-white">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="App Logo"
            className="h-20 md:h-24 object-contain drop-shadow-lg"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 tracking-wide">
          Welcome Back 👋
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm border border-red-400/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Phone */}
          <div>
            <label className="text-sm text-gray-200">Email or Phone</label>
            <input
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="Enter email or phone"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-200">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6">
          © {new Date().getFullYear()} Your Company
        </p>
      </div>
    </div>
  );
}
