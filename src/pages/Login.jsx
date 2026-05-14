import { useAppSettings } from "../context/AppSettingsContext";
import Login1 from "./Login1";
import Login2 from "./Login2";
import Login3 from "./Login3";

export default function Login() {
  const { settings, loading } = useAppSettings();

  // 🔥 WAIT until settings loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  const loginType = settings?.login_type || "login1";

  const map = {
    login1: Login1,
    login2: Login2,
    login3: Login3,
  };

  const Component = map[loginType] || Login1;

  return <Component />;
}
