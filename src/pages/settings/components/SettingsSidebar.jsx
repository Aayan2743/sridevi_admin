import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const menu111 = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Logo", path: "/settings/logo" },
  { label: "Social media", path: "/settings/social-media" },
  { label: "Payment gateway", path: "/settings/payment-gateway" },
  { label: "Variation Settings", path: "/settings/variation-settings" },
  { label: "Whats App Integration", path: "/settings/whatsapp-integration" },
  { label: "Contact Page Settings", path: "/settings/contact-page" },
  { label: "Customer Care Settings", path: "/settings/customer-care-settings" },
  { label: "coupons-settings", path: "/settings/coupons-settings" },
  { label: "Banner-settings", path: "/settings/banner-settings" },
  { label: "Landing Banner Settings", path: "/settings/landing-banner-settings" },
  { label: "Shipping-settings", path: "/settings/shipping-settings" },
  { label: "Product Sections", path: "/settings/product-sections" },

    { label: "My Whats App", path: "/my-whatsapp" },

  {
    label: "Footer Sections",
    children: [
      { label: "Manage Sections", path: "/settings/footer-sections" },
      { label: "Reorder Sections", path: "/settings/footer-sections/reorder" },
      { label: "Page Settings", path: "/settings/pages" },
    ],
  },

  {
    label: "Blog Sections",
    children: [
      { label: "Blog-categories", path: "/settings/blog-categories" },
      { label: "Blog", path: "/settings/blogs" },
    ],
  },
];


const menu = [
  { label: "Profile", path: "/settings/profile", permission: "settings.profile" },
  { label: "Logo", path: "/settings/logo", permission: "settings.logo" },
  { label: "Social media", path: "/settings/social-media", permission: "settings.social_media" },
  { label: "Payment gateway", path: "/settings/payment-gateway", permission: "settings.payment_gateway" },
  { label: "Variation Settings", path: "/settings/variation-settings", permission: "settings.variation" },
  { label: "Whats App Integration", path: "/settings/whatsapp-integration", permission: "settings.whatsapp" },
  { label: "Contact Page Settings", path: "/settings/contact-page", permission: "settings.contact" },
  { label: "Customer Care Settings", path: "/settings/customer-care-settings", permission: "settings.customer_care" },
  { label: "Coupons", path: "/settings/coupons-settings", permission: "settings.coupons" },
  { label: "Banner", path: "/settings/banner-settings", permission: "settings.banner" },
  // { label: "Landing Banner", path: "/settings/landing-banner-settings", permission: "settings.landing_banner" },
  { label: "Shipping", path: "/settings/shipping-settings", permission: "settings.shipping" },
  { label: "Product Sections", path: "/settings/product-sections", permission: "settings.product_sections" },

  // { label: "My Whats App", path: "/my-whatsapp", permission: "whatsapp.view" },

  // {
  //   label: "Footer Sections",
  //   children: [
  //     { label: "Manage Sections", path: "/settings/footer-sections", permission: "settings.footer_sections" },
  //     { label: "Reorder Sections", path: "/settings/footer-sections/reorder", permission: "settings.footer_reorder" },
  //     { label: "Page Settings", path: "/settings/pages", permission: "settings.pages" },
  //   ],
  // },

  // {
  //   label: "Blog Sections",
  //   children: [
  //     { label: "Blog Categories", path: "/settings/blog-categories", permission: "settings.blog_categories" },
  //     { label: "Blog", path: "/settings/blogs", permission: "settings.blogs" },
  //   ],
  // },
];

// export default function SettingsSidebar() {
//   const [openMenu, setOpenMenu] = useState(null);
//   const { can,permission } = useAuth();
//   console.log("User Permissions in Sidebar:", permission);

//   return (
//     <div className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen">
//       {/* Header */}
//       <div className="p-6 border-b border-gray-200">
//         <h2 className="text-xl font-bold text-gray-900">Settings</h2>
//       </div>

//       {/* Menu Items */}
//       <ul className="space-y-0 text-sm">
//         {menu.map((item, index) => {
//           return (
//             <li key={index}>
//               {/* Normal Menu Item */}
//               {!item.children && (
//                 <NavLink
//                   to={item.path}
//                   className={({ isActive }) =>
//                     `block px-6 py-3 transition border-l-4 ${
//                       isActive
//                         ? "bg-blue-50 text-blue-600 font-medium border-l-blue-600"
//                         : "text-gray-700 hover:bg-gray-100 border-l-transparent"
//                     }`
//                   }
//                 >
//                   {item.label}
//                 </NavLink>
//               )}

//               {/* Parent Menu */}
//               {item.children && (
//                 <>
//                   <button
//                     onClick={() =>
//                       setOpenMenu(openMenu === item.label ? null : item.label)
//                     }
//                     className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 transition flex justify-between items-center border-l-4 border-l-transparent"
//                   >
//                     <span className="font-medium">{item.label}</span>
//                     <ChevronDown
//                       size={16}
//                       className={`transition ${openMenu === item.label ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {openMenu === item.label && (
//                     <ul className="bg-gray-100">
//                       {item.children.map((child) => (
//                         <li key={child.label}>
//                           <NavLink
//                             to={child.path}
//                             className={({ isActive }) =>
//                               `block px-6 py-2.5 text-sm transition border-l-4 ${
//                                 isActive
//                                   ? "bg-blue-50 text-blue-600 font-medium border-l-blue-600"
//                                   : "text-gray-600 hover:bg-gray-200 border-l-transparent"
//                               }`
//                             }
//                           >
//                             {child.label}
//                           </NavLink>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               )}
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }


export default function SettingsSidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <aside className="sticky top-0 h-screen w-72 border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Settings</h2>
        <p className="mt-0.5 text-xs text-slate-500">System configuration</p>
      </div>

      <ul className="space-y-1 overflow-y-auto p-3 text-sm">
        {menu.map((item, index) => {
          return (
            <li key={index}>
              {/* ✅ Normal Item */}
              {!item.children && (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 transition ${
                      isActive
                        ? "bg-slate-900 font-medium text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )}

              {/* ✅ Parent Menu */}
              {item.children && (
                <>
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.label ? null : item.label)
                    }
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100"
                  >
                    <span className="font-medium">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition ${openMenu === item.label ? "rotate-180 text-slate-700" : "text-slate-500"}`}
                    />
                  </button>

                  {openMenu === item.label && (
                    <ul className="ml-2 mt-1 space-y-1 rounded-md border border-slate-200 bg-slate-50 p-2">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `block rounded-md px-3 py-1.5 text-xs transition ${
                                isActive
                                  ? "bg-white font-semibold text-slate-900"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}