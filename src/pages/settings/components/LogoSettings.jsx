import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import useDynamicTitle from "../../../hooks/useDynamicTitle";
import { useLogoSettings } from "../../../context/LogoSettingsContext";
import defaultImage from "../../../assets/profile.jpg";
import { useAuth } from "../../../auth/AuthContext";  
import AccessDenied from "../../components/AccessDenied";

const DEFAULT_LOGO = defaultImage;
const DEFAULT_FAVICON = defaultImage;

export default function LogoSettings() {

    const { can } = useAuth();
  useDynamicTitle("Logo Settings");

  const { settings, getLogoSettings, updateLogoSettings } = useLogoSettings();

  const [editMode, setEditMode] = useState(false);

  const [appName, setAppName] = useState("");
  const [logo, setLogo] = useState(DEFAULT_LOGO);
  const [favicon, setFavicon] = useState(DEFAULT_FAVICON);

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  /* ---------------- LOAD SETTINGS ---------------- */
  useEffect(() => {
    getLogoSettings();
  }, []);

  /* ---------------- MAP CONTEXT DATA ---------------- */
  useEffect(() => {
    if (!settings) return;

    setAppName(settings.app_name ?? "");

    setLogo(settings.app_logo_url || DEFAULT_LOGO);

    setFavicon(settings.app_favicon_url || DEFAULT_FAVICON);
  }, [settings]);

  /* ---------------- IMAGE HANDLER ---------------- */
  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (type === "logo") {
      setLogo(preview);
      setLogoFile(file);
    } else {
      setFavicon(preview);
      setFaviconFile(file);
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    const formData = new FormData();

    formData.append("app_name", appName);

    if (logoFile) {
      formData.append("app_logo", logoFile);
    }

    if (faviconFile) {
      formData.append("app_favicon", faviconFile);
    }

    const success = await updateLogoSettings(formData);

    if (success) {
      setEditMode(false);
      setLogoFile(null);
      setFaviconFile(null);
    }
  };

     if (!can("settings.logo")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        {/* HEADER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Brand Assets</h2>
            <p className="mt-1 text-xs text-slate-500">
              Update your application name, main logo, and favicon used across the platform.
            </p>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* APPLICATION NAME */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Application Name
          </p>

          {editMode ? (
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 md:w-1/2"
            />
          ) : (
            <p className="text-sm font-medium text-slate-700">{appName || "—"}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">App Logo</p>
              <p className="mt-1 text-[11px] text-slate-500">Recommended: square PNG with transparent background.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-400">No Logo</span>
                )}
              </div>

              {editMode && (
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageChange(e, "logo")}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Favicon</p>
              <p className="mt-1 text-[11px] text-slate-500">Recommended: 32x32 PNG/ICO for browser tabs.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                {favicon ? (
                  <img
                    src={favicon}
                    alt="Favicon"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">ICO</span>
                )}
              </div>

              {editMode && (
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Upload Favicon
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageChange(e, "favicon")}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
