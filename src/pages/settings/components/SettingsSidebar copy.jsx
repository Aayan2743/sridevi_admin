import { useState } from "react";
import { NavLink } from "react-router-dom";
const [openMenu, setOpenMenu] = useState(null);

const menu = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Logo", path: "/settings/logo" },
  { label: "Social media", path: "/settings/social-media" },
  { label: "Payment gateway", path: "/settings/payment-gateway" },
  { label: "Variation Settings", path: "/settings/variation-settings" },
  { label: "Whats App Integration", path: "/settings/whatsapp-integration" },
  { label: "Contact Page Settings", path: "/settings/contact-page" },
  { label: "Customer Care Settings", path: "/settings/customer-care-settings" },
  // { label: "account-settings", path: "/settings/account-settings" },
  { label: "coupons-settings", path: "/settings/coupons-settings" },
  { label: "Banner-settings", path: "/settings/banner-settings" },
  {
    label: "Landing Banner Settings",
    path: "/settings/landing-banner-settings",
  },
  { label: "Shipping-settings", path: "/settings/shipping-settings" },
  { label: "Product Sections", path: "/settings/product-sections" },
  // { label: "Footer Sections", path: "/settings/footer-sections" },
  // { label: "Footer Sections Reorder", path: "/settings/footer-sections/reorder" },   



  {
    label: "Footer Sections",
    children: [
      { label: "Manage Sections", path: "/settings/footer-sections" },
      { label: "Reorder Sections", path: "/settings/footer-sections/reorder" },
    ],
  },
  { label: "Blog-categories", path: "/settings/blog-categories" },
  { label: "Blog Settings", path: "/settings/blogs" },
  { label: "Page Settings", path: "/settings/pages" },
  // { label: "Settings", path: "" },
  // ContactSettings
];
export default function SettingsSidebar() {
  // return (
  //   <div className="w-60">
  //     <ul className="space-y-1 text-sm">
  //       {menu.map((item) => (
  //         <NavLink
  //           key={item.label}
  //           to={item.path}
  //           className={({ isActive }) =>
  //             `block px-3 py-2 rounded-md cursor-pointer ${
  //               isActive
  //                 ? "bg-blue-50 text-blue-600 font-medium"
  //                 : "text-gray-600 hover:bg-gray-50"
  //             }`
  //           }
  //         >
  //           {item.label}
  //         </NavLink>
  //       ))}
  //     </ul>
  //   </div>
  // );


   return (
    <div className="w-60">
      <ul className="space-y-1 text-sm">

        {menu.map((item, index) => (
          <li key={index}>

            {/* Normal Menu Item */}
            {!item.children && (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )}

            {/* Parent Menu */}
            {item.children && (
              <>
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.label ? null : item.label)
                  }
                  className="w-full text-left px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 flex justify-between items-center"
                >
                  {item.label}
                  <span>{openMenu === item.label ? "▲" : "▼"}</span>
                </button>

                {openMenu === item.label && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <NavLink
                          to={child.path}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-sm ${
                              isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
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
        ))}

      </ul>
    </div>
  );
}
