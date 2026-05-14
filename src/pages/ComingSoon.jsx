import { Mail, Sparkles } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white border rounded-lg p-8 w-[90%] max-w-md text-center">
        <h1 className="text-3xl font-semibold text-gray-800">Coming Soon</h1>

        <p className="text-gray-600 mt-3 text-sm">
          This feature is under development and will be available soon.
        </p>

        <div className="mt-6">
          <p className="text-xs text-gray-500">Please check back later.</p>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Your Company
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
