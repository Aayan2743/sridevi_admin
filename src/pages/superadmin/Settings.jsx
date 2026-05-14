import { useState, useEffect } from "react";
import api from "../../api/axios"; // ✅ use your axios instance

export default function Settings() {
  const [projectName, setProjectName] = useState("");
  const [logo, setLogo] = useState(null);
  const [loginType, setLoginType] = useState("login1");
  const [loading, setLoading] = useState(false);

  // 🔥 GET SETTINGS
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/super-admin-dashboard/settings/get");

      setProjectName(res.data.project_name || "");
      setLoginType(res.data.login_type || "login1");
    } catch (err) {
      console.log("GET ERROR:", err);
    }
  };

  // 🔥 SAVE SETTINGS
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("project_name", projectName);
      formData.append("login_type", loginType);
      if (logo) formData.append("logo", logo);

      await api.post("/super-admin-dashboard/settings/update", formData);

      alert("Settings saved ✅");

      // 🔥 refresh settings
      await fetchSettings();

      // 🔥 force UI update (important for login page)
      window.location.reload();
    } catch (err) {
      console.log("SAVE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Project Name */}
      <div>
        <label className="text-sm text-gray-400">Project Name</label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full mt-1 p-2 bg-gray-800 rounded text-white"
        />
      </div>

      {/* Logo */}
      <div>
        <label className="text-sm text-gray-400">Upload Logo</label>
        <input
          type="file"
          onChange={(e) => setLogo(e.target.files[0])}
          className="w-full mt-1 text-white"
        />
      </div>

      {/* 🔥 Login UI Selection */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">
          Select Login UI
        </label>

        <div className="grid grid-cols-3 gap-3">
          {["login1", "login2", "login3"].map((type) => (
            <div
              key={type}
              onClick={() => setLoginType(type)}
              className={`cursor-pointer p-3 rounded-lg border text-center transition ${
                loginType === type
                  ? "border-purple-500 bg-purple-600/20"
                  : "border-white/10 hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-medium">{type.toUpperCase()}</p>

              <p className="text-xs text-gray-400 mt-1">
                {type === "login1" && "Glass UI"}
                {type === "login2" && "Minimal UI"}
                {type === "login3" && "Split UI"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
