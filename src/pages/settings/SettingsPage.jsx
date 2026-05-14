import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../components/AccessDenied";

export default function SettingsPage() {
  const { can } = useAuth();

  if (!can("settings.view")) {
    return <AccessDenied />;
  }
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:px-6">
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage platform configuration and module preferences.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <Outlet />
      </div>
    </div>
  );
}
