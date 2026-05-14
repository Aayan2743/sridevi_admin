import { useState, useEffect } from "react";
import SettingsLayout from "../SettingsLayout";
import { Eye, EyeOff, MessageCircle } from "lucide-react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../../auth/AuthContext"; 
import AccessDenied from "../../components/AccessDenied";

export default function WhatsAppIntegrationSettings() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);


  const [editMode, setEditMode] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin-dashboard/whatsapp-settings");

      if (res.data?.success) {
        setEnabled(res.data.data.enabled);
        setApiKey(res.data.data.api_key || "");
        setBaseUrl(res.data.data.base_url || "");
      } else {
        setError("Failed to load settings");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await api.post("/admin-dashboard/whatsapp-settings", {
        enabled,
        api_key: apiKey,
        base_url: baseUrl,
      });

      if (res.data?.success) {
        toast.success("Settings updated successfully");
        setEditMode(false);
        fetchSettings();
      } else {
        setError(res.data?.message || "Update failed");
      }
    } catch (err) {
      const message =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        "Update failed";
      setError(message);
    } finally {
      setSaving(false);
    }
  };


   if (!can("settings.whatsAppintegration")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading settings...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait</p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integration</h1>
              <p className="text-gray-600 mt-1">Configure your WhatsApp API settings</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-xl"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your WhatsApp API configuration</p>
            </div>

            {!editMode ? (

       
    can("settings.whatsAppintegrationedit") && (



              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                Edit Settings
              </button>

              )



            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"></div>
                    </div>
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setError(null);
                    fetchSettings();
                  }}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="px-8 py-8 space-y-8">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-base font-semibold text-gray-900">Enable WhatsApp Integration</p>
                <p className="text-sm text-gray-600 mt-1">
                  Turn WhatsApp integration on or off
                </p>
              </div>

              {editMode ? (
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      enabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      enabled ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              )}
            </div>

            {/* API Key Field */}
                      {
            can("settings.whatsAppintegrationedit") && (
              <>
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-base font-semibold text-gray-900">API Key</span>
                        <span className="text-red-500 ml-1">*</span>
                        <p className="text-sm text-gray-600 mt-1">Your WhatsApp API authentication key</p>
                      </label>

                      {editMode ? (
                        <div className="relative">
                          <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API Key"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition"
                          >
                            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 font-mono">
                            {apiKey ? "••••••••••••••••" : "Not configured"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Base URL Field */}
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-base font-semibold text-gray-900">Base URL</span>
                        <span className="text-red-500 ml-1">*</span>
                        <p className="text-sm text-gray-600 mt-1">Your WhatsApp API endpoint URL</p>
                      </label>

                      {editMode ? (
                        <input
                          type="url"
                          value={baseUrl}
                          onChange={(e) => setBaseUrl(e.target.value)}
                          placeholder="https://api.whatsapp.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600 break-all">
                            {baseUrl || "Not configured"}
                          </p>
                        </div>
                      )}
                    </div>
                    </>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">ℹ️ Note:</span> Make sure your API credentials are correct and your WhatsApp Business Account is properly configured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
