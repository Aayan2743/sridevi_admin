import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const LogoSettingsContext = createContext();

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const LogoSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  /* -------- GET LOGO SETTINGS -------- */
  const getLogoSettings = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const res = await api.get("/admin-dashboard/app-logo-settings");
      setSettings(res.data?.data ?? null);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to load logo settings")
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };
  /* -------- UPDATE LOGO SETTINGS -------- */
  const updateLogoSettings = async (formData) => {
    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/app-logo-settings",
        formData
      );

      if (res.data?.success === false) {
        toast.error(res.data?.message || "Update failed");
        return false;
      }

      toast.success("Logo settings updated");
      await getLogoSettings({ silent: true });
      return true;
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Update failed")
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LogoSettingsContext.Provider
      value={{
        settings,
        loading,
        getLogoSettings,
        updateLogoSettings,
      }}
    >
      {children}
    </LogoSettingsContext.Provider>
  );
};

export const useLogoSettings = () => {
  const ctx = useContext(LogoSettingsContext);
  if (!ctx) {
    throw new Error(
      "useLogoSettings must be used within LogoSettingsProvider"
    );
  }
  return ctx;
};
