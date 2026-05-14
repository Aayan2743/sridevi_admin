import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const flow = JSON.parse(sessionStorage.getItem("reset_flow"));

  // 🔹 6 DIGITS
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!flow?.email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [flow, navigate]);

  /* ================= OTP INPUT ================= */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // Auto focus next
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/verify-otp", {
        email: flow.email,
        otp: enteredOtp,
      });

      sessionStorage.setItem(
        "reset_flow",
        JSON.stringify({
          email: flow.email,
          otp: enteredOtp,
          otp_verified: true,
        }),
      );

      navigate("/reset-password");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const resendOtp = async () => {
    setResending(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", {
        email: flow.email,
      });
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-2">Verify OTP</h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter the 6-digit OTP sent to
          <br />
          <span className="font-medium">{flow?.email}</span>
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* OTP BOXES */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                maxLength="1"
                inputMode="numeric"
                className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            ))}
          </div>

          <button
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* RESEND */}
        <div className="text-center mt-4">
          <button
            disabled={resending}
            onClick={resendOtp}
            className="text-sm text-cyan-600 hover:underline"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
