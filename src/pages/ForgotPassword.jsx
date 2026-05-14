// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAppSettings } from "../context/AppSettingsContext";

// export default function ForgotPassword() {
//   const { settings } = useAppSettings();
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await api.post("/auth/forgot-password", { email });

//       // Save flow
//       sessionStorage.setItem("reset_flow", JSON.stringify({ email }));

//       navigate("/verify-otp");
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-cover bg-center flex items-center justify-end"
//       style={{ backgroundImage: "url('./logo/loginbanner.jpg')" }}
//     >
//       <div className="absolute inset-0 bg-black/40" />

//       <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-8 mr-0 md:mr-10">
//         <div className="flex justify-center mb-6">
//           <img src={settings.logo || "/logo/pos.png"} className="h-20" />
//         </div>

//         <h2 className="text-xl font-semibold text-center mb-6">
//           Forgot Password
//         </h2>

//         {error && <p className="text-red-600 mb-4">{error}</p>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Enter email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-3 border rounded-lg"
//             required
//           />

//           <button
//             disabled={loading}
//             className="w-full bg-cyan-500 text-white py-3 rounded-lg"
//           >
//             {loading ? "Sending OTP..." : "Send OTP"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ============ SEND OTP ============ */
  const sendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setShowOtpModal(true); // 🔥 OPEN MODAL
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ============ OTP INPUT ============ */
  const handleOtpChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const copy = [...otp];
    copy[i] = val;
    setOtp(copy);

    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`).focus();
    }
  };

  /* ============ VERIFY OTP ============ */
  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    try {
      await api.post("/auth/verify-otp", { email, otp: enteredOtp });
      setShowOtpModal(false);
      setShowResetModal(true); // 🔥 NEXT MODAL
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  /* ============ RESET PASSWORD ============ */
  const resetPassword = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        email,
        otp: otp.join(""),
        password,
      });

      //   setShowResetModal(false);

      window.location.href = "/login";
      alert("Password reset successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Forgot Password
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg mb-4"
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-cyan-500 text-white py-3 rounded-lg"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>

      {/* ================= OTP MODAL ================= */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Verify OTP
            </h3>

            <div className="flex justify-center gap-2 mb-4">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  maxLength="1"
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="w-12 h-12 border text-center text-lg rounded"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              className="w-full bg-cyan-500 text-white py-3 rounded-lg"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Reset Password
            </h3>

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded mb-3"
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border rounded mb-4"
            />

            <button
              onClick={resetPassword}
              className="w-full bg-cyan-500 text-white py-3 rounded-lg"
            >
              Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
