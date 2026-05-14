



import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Layers,
  LogOut,
  Search,
  Bell,
} from "lucide-react";

import { useSuperAdminAuth } from "../auth/SuperAdminAuthContext";

export default function SuperAdminLayout() {
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/super-admin" },
    { name: "Admins", icon: Users, path: "/super-admin/admins" },
    { name: "Roles", icon: ShieldCheck, path: "/super-admin/roles" },
    { name: "Modules", icon: Layers, path: "/super-admin/modules" },
    { name: "Settings", icon: Settings, path: "/super-admin/settings" },
  ];

  const { logout } = useSuperAdminAuth();

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-black to-gray-900 border-r border-white/10 flex flex-col justify-between p-5">
        
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center font-bold">
              SA
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-400">
                Super Admin
              </h2>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menu.map((item, i) => (
              <NavLink
                key={i}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "hover:bg-white/10 text-gray-300"
                  }`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* User */}
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm">
              SA
            </div>
            <div>
              <p className="text-sm">Super Admin</p>
              <p className="text-xs text-gray-400">admin@mail.com</p>
            </div>
          </div>

          {/* Logout */}
         <button
            onClick={logout}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
            >
            <LogOut size={18} /> Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur">
          
          {/* Left */}
          <h1 className="font-semibold text-lg">
            Super Admin Panel
          </h1>

          {/* Right */}
          <div className="flex items-center gap-4">
            
            {/* Search */}
            <div className="hidden md:flex items-center bg-white/10 px-3 py-1 rounded-lg">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm px-2 text-white"
              />
            </div>

            {/* Notification */}
            <Bell className="text-gray-400 cursor-pointer hover:text-white" />

            {/* Avatar */}
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-gray-950 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}