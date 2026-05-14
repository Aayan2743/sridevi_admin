


// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   Home,
//   Box,
//   Tag,
//   ShoppingCart,
//   BarChart,
//   Package,
//   Settings,
//   Users,

// } from "lucide-react";
// import { useProfile } from "../context/ProfileContext";
// import { useLogoSettings } from "../context/LogoSettingsContext";
// import defaultimage from "../assets/profile.jpg";
// import { isHerbal, isHamsini } from "../config/projectConfig.js";
// import api from "../api/axios.js";

// const SIDEBAR_WIDTH = "88px";
// const FALLBACK_LOGO = defaultimage;

// export default function Sidebar({ open, setOpen, logout }) {

//   const [permissions, setPermissions] = useState([]);

// useEffect(() => {
//   api.get("/admin-dashboard/my-permissions").then(res => {

//     console.log("My Permissions:", res.data); // Debugging line
//     setPermissions(res.data.permissions);
//   });
// }, []);


//   const location = useLocation();
//   const { settings: logoSettings, getLogoSettings } = useLogoSettings();

//   const user = JSON.parse(localStorage.getItem("user"));
//   const role = user?.role;

//   const [logo, setLogo] = useState(FALLBACK_LOGO);

//   useEffect(() => {
//     getLogoSettings();
//   }, []);

//   useEffect(() => {
//     if (!logoSettings) return;
//     setLogo(logoSettings.app_logo_url || FALLBACK_LOGO);
//   }, [logoSettings]);

//   const isActive = (path) => {
//     const pathname = location.pathname;
//     // Only highlight if it's an exact match (not a parent of another route)
//     if (pathname === path || pathname === path + "/") {
//       return "bg-yellow-200 text-orange-600";
//     }
//     return "text-gray-700 hover:bg-green-100";
//   };

//   const Item = ({ to, icon: Icon, label }) => (
//     <Link
//       to={to}
//       onClick={() => setOpen(false)}
//       className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-center ${isActive(
//         to
//       )}`}
//     >
//       <Icon size={20} />
//       <span className="text-[10px] leading-tight max-w-[64px]">
//         {label}
//       </span>
//     </Link>
//   );

//   return (
//     <aside
//       className={`
//         fixed inset-y-0 left-0 z-40
//         w-[88px] bg-green-50 border-r
//         transform transition-transform duration-300 ease-in-out
//         ${open ? "translate-x-0" : "-translate-x-full"}
//         md:translate-x-0
//       `}
//       style={{ width: SIDEBAR_WIDTH }}
//     >
//       <div className="h-full flex flex-col">
//         {/* LOGO */}
//         <div className="h-16 flex items-center justify-center border-b">
//           <img src={logo} alt="App Logo" className="h-8" />
//         </div>

//         {/* MENU */}
//         <nav className="flex-1 overflow-y-auto p-2 space-y-1">

//           {/* ================= EMPLOYEE ================= */}
//           {role === "employee" && (
//             <>
//               {isHerbal && (
//                 <>
//                   <Item to="/pos" icon={ShoppingCart} label="POS" />
//                   <Item to="/pos/orders" icon={Package} label="POS Orders" />
//                   <Item to="/staff-attendance" icon={Users} label="Staff Attendance" />
//                   <Item to="/customers" icon={Users} label="Customers" />
//                 </>
//               )}

//               {isHamsini && (
//                 <>
//                   <Item to="/pos" icon={ShoppingCart} label="POS" />
//                   <Item to="/pos/orders" icon={Package} label="POS Orders" />
//                   <Item to="/staff-attendance" icon={Users} label="Staff Attendance" />
//                 </>
//               )}
//             </>
//           )}

//           {/* ================= ADMIN ================= */}
//           {role === "admin" && (
//             <>
//               {isHerbal && (
//                 <>
//                   <Item to="/dashboard" icon={Home} label="Dashboard" />
//                   <Item to="/products" icon={Box} label="Products" />
//                        <Item to="/bulk-variant-images" icon={Box} label="Bulk Variant Images" />
//                   <Item
//                     to="/add-categories"
//                     icon={Tag}
//                     label="Add Category"
//                   />

//                     <Item
//                     to="/category-sorter"
//                     icon={Tag}
//                     label="Sort Category"
//                   />



                  
//                   <Item to="/pos" icon={ShoppingCart} label="POS" />
//                   <Item
//                     to="/pos/orders"
//                     icon={Package}
//                     label="POS Orders"
//                   />
//                   <Item
//                     to="/online-orders"
//                     icon={Package}
//                     label="Online Orders"
//                   />
//                   <Item to="/customers" icon={Users} label="Customers" />
//                   <Item to="/users" icon={Users} label="Users" />
//                   <Item
//                     to="/staff-attendance"
//                     icon={Users}
//                     label="Staff Attendance"
//                   />
//                   <Item
//                     to="/settings/profile"
//                     icon={Settings}
//                     label="Settings"
//                   />

//                    <Item
//                     to="/my-whatsapp"
//                     icon={Users}
//                     label="my whatsapp"
//                   />
//                 </>
//               )}

//               {isHamsini && (
//                 <>
//                   <Item to="/dashboard" icon={Home} label="Dashboard" />
//                   <Item to="/products" icon={Box} label="Products" />
//                        <Item to="/bulk-variant-images" icon={Box} label="Bulk Variant Images" />
//                   <Item to="/categories" icon={Tag} label="Category" />
//                   <Item to="/orders" icon={Package} label="Orders" />
//                   <Item to="/users" icon={Users} label="Users" />
//                   <Item
//                     to="/staff-attendance"
//                     icon={Users}
//                     label="Staff Attendance"
//                   />


//                    <Item
//                     to="/roles"
//                     icon={Settings}
//                     label="Roles"
//                   />

                  
//                    <Item
//                     to="/permissions"
//                     icon={Settings}
//                     label="Permissions"
//                   />


//                       <Item
//                     to="/assign-role"
//                     icon={Settings}
//                     label="Assign Role"
//                   />


                  
//                   <Item
//                     to="/settings/profile"
//                     icon={Settings}
//                     label="Settings"
//                   />
//                 </>
//               )}
//             </>
//           )}
//         </nav>

//         {/* LOGOUT */}
//         <div className="p-2 border-t">
//           <button
//             onClick={logout}
//             className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }



import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Box,
  Tag,
  ShoppingCart,
  Package,
  Settings,
  Users,
} from "lucide-react";

import { useLogoSettings } from "../context/LogoSettingsContext";
import defaultimage from "../assets/profile.jpg";
import { isHerbal, isHamsini } from "../config/projectConfig.js";

const SIDEBAR_WIDTH = "88px";
const FALLBACK_LOGO = defaultimage;

export default function Sidebar({ open, setOpen, logout }) {
  const [permissions, setPermissions] = useState([]);
  const location = useLocation();
  const { settings: logoSettings, getLogoSettings } = useLogoSettings();

  const [logo, setLogo] = useState(FALLBACK_LOGO);

  /* ================= LOAD PERMISSIONS ================= */
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem("permissions")) || [];
    setPermissions(perms);
  }, []);

  /* ================= PERMISSION CHECK ================= */
  const can = (p) =>
    permissions.includes("*") || permissions.includes(p);

  /* ================= LOGO ================= */
  useEffect(() => {
    getLogoSettings();
  }, []);

  useEffect(() => {
    if (!logoSettings) return;
    setLogo(logoSettings.app_logo_url || FALLBACK_LOGO);
  }, [logoSettings]);

  /* ================= ACTIVE ================= */
  const isActive = (path) => {
    const pathname = location.pathname;
    if (pathname === path || pathname === path + "/") {
      return "bg-yellow-200 text-orange-600";
    }
    return "text-gray-700 hover:bg-green-100";
  };

  /* ================= MENU ITEM ================= */
  const Item = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-center ${isActive(
        to
      )}`}
    >
      <Icon size={20} />
      <span className="text-[10px] leading-tight max-w-[64px]">
        {label}
      </span>
    </Link>
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        w-[88px] bg-green-50 border-r
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="h-full flex flex-col">
        {/* LOGO */}
        <div className="h-16 flex items-center justify-center border-b">
          <img src={logo} alt="App Logo" className="h-8" />
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">

          {/* ================= DASHBOARD ================= */}
          {can("view_dashboard") && (
            <Item to="/dashboard" icon={Home} label="Dashboard" />
          )}

          {/* ================= PRODUCTS ================= */}
          {can("view_products") && (
            <Item to="/products" icon={Box} label="Products" />
          )}

          {can("view_products") && (
            <Item
              to="/bulk-variant-images"
              icon={Box}
              label="Bulk Images"
            />
          )}

          {/* ================= CATEGORY ================= */}
          {can("view_categories") && (
            <Item to="/add-categories" icon={Tag} label="Category" />
          )}

          {can("view_categories") && (
            <Item to="/category-sorter" icon={Tag} label="Sort Category" />
          )}

          {/* ================= POS ================= */}
          {can("view_pos") && (
            <Item to="/pos" icon={ShoppingCart} label="POS" />
          )}

          {can("view_pos_orders") && (
            <Item to="/pos/orders" icon={Package} label="POS Orders" />
          )}

          {can("view_orders") && (
            <Item to="/online-orders" icon={Package} label="Online Orders" />
          )}

          {/* ================= USERS ================= */}
          {can("view_users") && (
            <Item to="/users" icon={Users} label="Users" />
          )}

          {can("view_customers") && (
            <Item to="/customers" icon={Users} label="Customers" />
          )}

          {can("view_staff") && (
            <Item
              to="/staff-attendance"
              icon={Users}
              label="Attendance"
            />
          )}

          {/* ================= ROLE MANAGEMENT ================= */}
          {can("manage_roles") && (
            <Item to="/roles" icon={Settings} label="Roles" />
          )}

          {can("manage_permissions") && (
            <Item to="/permissions" icon={Settings} label="Permissions" />
          )}

          {can("assign_roles") && (
            <Item to="/assign-role" icon={Settings} label="Assign Role" />
          )}

          {/* ================= SETTINGS ================= */}
          {can("view_settings") && (
            <Item
              to="/settings/profile"
              icon={Settings}
              label="Settings"
            />
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-2 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}