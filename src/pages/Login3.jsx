// // pages/login/Login3.jsx
// import { Eye, EyeOff } from "lucide-react";
// import { useState } from "react";
// // import { useLogin } from "../../hooks/useLogin";
// import { useLogin } from "../hooks/useLogin";
// import { useAppSettings } from "../context/AppSettingsContext";
// import defaultimage from "../assets/profile.jpg";

// export default function Login3() {
//   const {
//     loginValue,
//     setLoginValue,
//     password,
//     setPassword,
//     error,
//     loading,
//     handleSubmit,
//   } = useLogin();

//   const { settings } = useAppSettings();

//   const [showPassword, setShowPassword] = useState(false);

//   const logo =
//     settings?.logo && settings.logo.trim() !== ""
//       ? settings.logo
//       : defaultimage;

//   return (
//     <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
//       {/* Left Side (Banner) */}
//       <div
//         className="hidden md:flex items-center justify-center bg-cover bg-center"
//         style={{ backgroundImage: "url('/logo/loginbanner.jpg')" }}
//       >
//         <div className="bg-black/50 w-full h-full flex items-center justify-center">
//           <h1 className="text-white text-3xl font-bold px-10 text-center">
//             Welcome to Your Platform 🚀
//           </h1>
//         </div>
//       </div>

//       {/* Right Side (Form) */}
//       <div className="flex items-center justify-center bg-white p-6">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="flex justify-center mb-5">
//             <img src={logo} className="h-16 object-contain" />
//           </div>

//           <h2 className="text-xl font-semibold text-center mb-6 text-gray-700">
//             Login to continue
//           </h2>

//           {error && (
//             <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <input
//               type="text"
//               placeholder="Email or Phone"
//               value={loginValue}
//               onChange={(e) => setLoginValue(e.target.value)}
//               className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//             />

//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
//             >
//               {loading ? "Signing In..." : "Sign In"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useAppSettings } from "../context/AppSettingsContext";
import defaultimage from "../assets/profile.jpg";

export default function Login3() {
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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* 🔥 LEFT SIDE (Premium Banner) */}
      <div
        className="hidden md:flex relative items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/logo/loginbanner.jpg')" }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/80 via-indigo-700/70 to-blue-700/80"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-10">
          <h1 className="text-4xl font-bold mb-4 leading-snug">
            Welcome Back 👋
          </h1>
          <p className="text-lg text-white/80">
            Manage your business smarter, faster, and better.
          </p>
        </div>
      </div>

      {/* 🔥 RIGHT SIDE (Glass Form) */}
      <div className="flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} className="h-16 object-contain drop-shadow-md" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Sign In
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Enter your credentials to continue
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
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
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Extra Row */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 text-gray-500">
                <input type="checkbox" className="accent-indigo-600" />
                Remember me
              </label>

              <span className="text-indigo-600 cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
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
    </div>
  );
}
