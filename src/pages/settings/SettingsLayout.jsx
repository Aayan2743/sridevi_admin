import SettingsSidebar from "./components/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-[1600px]">
        <SettingsSidebar />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
