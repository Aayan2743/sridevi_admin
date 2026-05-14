import { useEffect } from "react";
import { useAppSettings } from "../context/AppSettingsContext";

export default function useDynamicTitle(pageTitle) {
  const { settings, loading } = useAppSettings();

  useEffect(() => {
    if (!loading && settings.app_name) {
      document.title = `${pageTitle} | ${settings.app_name}`;
    }
  }, [pageTitle, settings.app_name, loading]);
}
