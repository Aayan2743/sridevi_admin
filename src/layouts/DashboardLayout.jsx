import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLogoSettings } from "../context/LogoSettingsContext";
import { ChevronDown, Menu, X, Search } from "lucide-react";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { settings: logoSettings } = useLogoSettings();
  const location = useLocation();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menus = [
    { label: "Dashboard", path: "/dashboard" },
    {
      label: "Products",
      items: [
        { label: "All Products", path: "/products" },
        // { label: "POS Products", path: "/pos/products" },
        { label: "Bulk Images", path: "/bulk-variant-images" },
        { label: "Categories", path: "/add-categories" },
        { label: "Sort Category", path: "/category-sorter" },
      ],
    },
    {
      label: "Orders",
      items: [
        { label: "POS", path: "/pos" },
        { label: "POS Orders", path: "/pos/orders" },
        { label: "Online Orders", path: "/online-orders" },
      ],
    },
    {
      label: "Customers",
      items: [
        { label: "Customers", path: "/customers" },
        { label: "Attendance", path: "/staff-attendance" },
      ],
    },
    {
      label: "Management",
      items: [
        { label: "Roles", path: "/roles" },
        { label: "Assign Role", path: "/assign-role" },
      ],
    },
    {
      label: "Settings",
      items: [
        { label: "Profile", path: "/settings/profile" },
        { label: "WhatsApp", path: "/my-whatsapp" },
      ],
    },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 🔥 GLASS NAVBAR */}
      <header className="h-16 backdrop-blur-xl bg-white/70 border-b border-white/30 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          <span className="font-extrabold text-xl bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            {logoSettings?.app_name || "Application"}
          </span>
        </div>

        {/* 🔥 MENU */}
        <div className="hidden md:flex items-center gap-8">
          {menus.map((menu, i) => (
            <div key={i} className="relative group">
              {/* MENU ITEM */}
              <div
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === menu.label ? null : menu.label,
                  )
                }
                className={`flex items-center gap-1 cursor-pointer font-medium transition-all duration-200 ${
                  isActive(menu.path)
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {menu.path ? (
                  <Link to={menu.path}>{menu.label}</Link>
                ) : (
                  <>
                    {menu.label}
                    <ChevronDown
                      size={16}
                      className="transition-transform duration-200 group-hover:rotate-180"
                    />
                  </>
                )}
              </div>

              {/* 🔥 DROPDOWN */}
              {menu.items && activeDropdown === menu.label && (
                <div className="absolute top-full left-0 mt-3 w-64 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40 p-3 animate-fadeIn">
                  {menu.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setActiveDropdown(null)}
                      className={`block px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 🔥 RIGHT */}
        <div className="flex items-center gap-4">
          {/* SEARCH */}
          <div className="hidden md:flex items-center bg-white/70 backdrop-blur px-3 py-1 rounded-full shadow-inner border">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm px-2"
            />
          </div>

          {/* PROFILE */}
          <div className="relative">
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center font-semibold shadow-lg hover:scale-105 transition"
            >
              {user?.name?.charAt(0) || "A"}
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-3 bg-white/80 backdrop-blur-xl shadow-xl rounded-xl p-2 w-44 border">
                <div className="px-3 py-2 text-sm font-medium">
                  {user?.name}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🔥 MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b p-4 space-y-3">
          {menus.map((menu, i) => (
            <div key={i}>
              {menu.path ? (
                <Link to={menu.path}>{menu.label}</Link>
              ) : (
                <>
                  <p className="font-semibold">{menu.label}</p>
                  <div className="ml-3 mt-1 space-y-1">
                    {menu.items.map((item, idx) => (
                      <Link key={idx} to={item.path} className="block text-sm">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 CONTENT */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
