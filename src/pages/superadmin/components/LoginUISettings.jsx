import { useState, useEffect } from "react";
import axios from "axios";

export default function LoginUISettings() {
  const [loginType, setLoginType] = useState("login1");
  const [loading, setLoading] = useState(false);

  // get current setting
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/super-admin/settings");
      setLoginType(res.data.login_type || "login1");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post("/api/super-admin/settings", {
        login_type: loginType,
      });

      alert("Login UI updated successfully ✅");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold mb-4 text-purple-400">
        Login UI Settings
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["login1", "login2", "login3"].map((type) => (
          <div
            key={type}
            onClick={() => setLoginType(type)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              loginType === type
                ? "border-purple-500 bg-purple-600/20"
                : "border-white/10 hover:bg-white/10"
            }`}
          >
            <h3 className="font-medium mb-2">{type.toUpperCase()}</h3>
            <p className="text-xs text-gray-400">
              {type === "login1" && "Glass UI"}
              {type === "login2" && "Minimal Clean UI"}
              {type === "login3" && "Split Screen UI"}
            </p>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-5 bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-2 rounded-lg font-medium hover:opacity-90"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
