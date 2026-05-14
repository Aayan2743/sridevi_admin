import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isHerbal, isHamsini } from "./config/projectConfig";
import { useAuth } from "./auth/AuthContext";

/* AUTH */
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import { Toaster } from "react-hot-toast";

/* LAYOUT */
import DashboardLayout from "./layouts/DashboardLayout";

/* PAGES */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Employees from "./pages/Employees";
import ComingSoon from "./pages/ComingSoon";
import Category from "./pages/Category";
import Brands from "./pages/brands/Brands";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import POS from "./pos/POS";
import POSOrders from "./pages/POSOrders";
import POSOrderView from "./pages/POSOrderView";
import CustomerCombinedReport from "./pages/CustomerCombinedReport";
import StaffAttendanceCalendar from "./pages/StaffAttendanceCalendar";

import AddCategory from "./pages/AddCategory";
import CustomerManagement from "./pages/CustomerManagement";
import CustomerOrders from "./pages/CustomerOrders";
import ManualOrderDetails from "./pages/ManualOrderDetails";
import ManualOrders from "./pages/ManualOrders";

/* SETTINGS */
import SettingsPage from "./pages/settings/SettingsPage";
import ProfileSettings from "./pages/settings/components/ProfileSettings";
import LogoSettings from "./pages/settings/components/LogoSettings";
import SocialMediaSettings from "./pages/settings/components/SocialMediaSettings";
import PaymentGatewaySettings from "./pages/settings/components/PaymentGatewaySettings";
import VariationSettings from "./pages/settings/components/VariationSettings";
import WhatsAppIntegrationSettings from "./pages/settings/components/WhatsAppIntegrationSettings";
import CouponSettings from "./pages/settings/components/CouponSettings";
import BannerSettings from "./pages/settings/components/BannerSettings";
import ContactSettings from "./pages/settings/components/ContactSettings";
import CustomerCareSettings from "./pages/settings/components/CustomerCareSettings";
import ShippingSettings from "./pages/settings/components/ShippingSettings";
import EditProductSections from "./pages/settings/components/EditProductSections";
import ProductSectionAssign from "./pages/settings/components/ProductSectionAssign";

/* PROVIDERS */
import { LogoSettingsProvider } from "./context/LogoSettingsContext";
import { ProfileProvider } from "./context/ProfileContext";

/* BRAND PROTECTED */
import BrandProtectedRoute from "./auth/BrandProtectedRoute";
import ManualOrders1 from "./pages/ManualOrders1";
import MyAttendance from "./pages/MyAttendance";

import BulkVariantImages from "./pages/BulkVariantImages";
import BulkAddVariation from "./pages/BulkAddVariation";
import WhatsappChat from "./pages/WhatsappChat";
import CategorySorter from "./pos/components/CategorySorter";
import Roles from "./pages/RolesAndPermissions/Roles";
import RolePermission from "./pages/RolesAndPermissions/RolePermission";
import Permissions from "./pages/RolesAndPermissions/Permissions";
import AssignRole from "./pages/RolesAndPermissions/AssignRole";


function AppRoutes() {
  const { user, loading } = useAuth();
  const role = user?.role;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ================= PROTECTED ================= */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ================= EMPLOYEE ================= */}
        {role === "employee" && (
          <>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/pos" element={<POS />} />

            <Route path="/pos/orders" element={<ManualOrders1 />} />
            <Route
              path="/calling/order/:id"
              element={<ManualOrderDetails />}
            />

            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/pos/orders/:id" element={<POSOrderView />} />
            <Route path="/staff-attendance" element={<MyAttendance />} />
            <Route path="*" element={<Navigate to="/pos" />} />
          </>
        )}

        {/* MyAttendance  ,StaffAttendanceCalendar */}
        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            {/* HERBAL */}
            {isHerbal && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/add-bulk-variants" element={<BulkAddVariation />} />
                <Route path="/bulk-variant-images" element={<BulkVariantImages />} />
                <Route path="/add-categories" element={<AddCategory />} />
                <Route path="/pos" element={<POS />} />
                <Route
                  path="/customers"
                  element={<CustomerManagement />}
                />
                <Route
                  path="/customers/:id/orders"
                  element={<CustomerOrders />}
                />
                <Route path="/pos/orders" element={<ManualOrders />} />
                <Route
                  path="/calling/order/:id"
                  element={<ManualOrderDetails />}
                />
                <Route
                  path="/staff-attendance"
                  element={<StaffAttendanceCalendar />}
                />


                 <Route
                  path="/my-whatsapp"
                  element={<WhatsappChat />}
                />


                <Route
                  path="/category-sorter"
                  element={<CategorySorter />}
                />


                 <Route
                  path="/Roles"
                  element={<Roles />}
                />

                   <Route
                  path="/Add-Permissions"
                  element={<Permissions />}
                />

                


             
                <Route path="/online-orders" element={<OrdersPage />} />

                {/* SETTINGS */}
                <Route path="/settings" element={<SettingsPage />}>
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="logo" element={<LogoSettings />} />
                  <Route
                    path="social-media"
                    element={<SocialMediaSettings />}
                  />
                  <Route
                    path="payment-gateway"
                    element={<PaymentGatewaySettings />}
                  />
                  <Route
                    path="variation-settings"
                    element={<VariationSettings />}
                  />
                  <Route
                    path="whatsapp-integration"
                    element={<WhatsAppIntegrationSettings />}
                  />
                  <Route
                    path="coupons-settings"
                    element={<CouponSettings />}
                  />
                  <Route
                    path="banner-settings"
                    element={<BannerSettings />}
                  />
                  <Route
                    path="contact-page"
                    element={<ContactSettings />}
                  />
                  <Route
                    path="customer-care-settings"
                    element={<CustomerCareSettings />}
                  />
                  <Route
                    path="shipping-settings"
                    element={<ShippingSettings />}
                  />
                  <Route
                    path="product-sections"
                    element={<EditProductSections />}
                  />
                  <Route
                    path="footer-sections"
                    element={<ProductSectionAssign />}
                  />
                  <Route
                    path="footer-sections/reorder"
                    element={<ProductSectionAssign />}
                  />
                  <Route
                    path="pages"
                    element={<ProductSectionAssign />}
                  />
                  <Route
                    path="blog-categories"
                    element={<ComingSoon />}
                  />
                  <Route
                    path="blogs"
                    element={<ComingSoon />}
                  />
                  <Route
                    path="landing-banner-settings"
                    element={<BannerSettings />}
                  />
                </Route>
              </>
            )}

            {/* HAMSINI */}
            {isHamsini && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                 <Route path="/bulk-variant-images" element={<BulkVariantImages />} />
                <Route path="/categories" element={<Category />} />
                <Route
                  path="/staff-attendance"
                  element={<StaffAttendanceCalendar />}
                />
              </>
            )}

            {/* COMMON ADMIN */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/orders" element={<POSOrders />} />
            <Route path="/pos/orders/:id" element={<POSOrderView />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/users" element={<CustomerCombinedReport />} />
            <Route path="/expenses" element={<ComingSoon />} />
            <Route path="/reports" element={<ComingSoon />} />

            
                 <Route
                  path="/Roles"
                  element={<Roles />}
                />

                
                 <Route
                  path="/Add-Permissions"
                  element={<Permissions />}
                />


  <Route
                  path="/assign-role"
                  element={<AssignRole />}
                />

            
                 

                <Route
                  path="/role-permission/:role"
                  element={<RolePermission />}
                />

            <Route
              path="/brands"
              element={
                <BrandProtectedRoute>
                  <Brands />
                </BrandProtectedRoute>
              }
            />

            {/* SETTINGS */}
            <Route path="/settings" element={<SettingsPage />}>
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="logo" element={<LogoSettings />} />
              <Route
                path="social-media"
                element={<SocialMediaSettings />}
              />
              <Route
                path="payment-gateway"
                element={<PaymentGatewaySettings />}
              />
              <Route
                path="variation-settings"
                element={<VariationSettings />}
              />
              <Route
                path="whatsapp-integration"
                element={<WhatsAppIntegrationSettings />}
              />
              <Route
                path="coupons-settings"
                element={<CouponSettings />}
              />
              <Route
                path="banner-settings"
                element={<BannerSettings />}
              />
              <Route
                path="contact-page"
                element={<ContactSettings />}
              />
              <Route
                path="customer-care-settings"
                element={<CustomerCareSettings />}
              />
              <Route
                path="shipping-settings"
                element={<ShippingSettings />}
              />
              <Route
                path="product-sections"
                element={<EditProductSections />}
              />
              <Route
                path="footer-sections"
                element={<ProductSectionAssign />}
              />
              <Route
                path="footer-sections/reorder"
                element={<ProductSectionAssign />}
              />
              <Route
                path="pages"
                element={<ProductSectionAssign />}
              />
              <Route
                path="blog-categories"
                element={<ComingSoon />}
              />
              <Route
                path="blogs"
                element={<ComingSoon />}
              />
              <Route
                path="landing-banner-settings"
                element={<BannerSettings />}
              />
            </Route>
          </>
        )}
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LogoSettingsProvider>
        <ProfileProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <AppRoutes />
        </ProfileProvider>
      </LogoSettingsProvider>
    </BrowserRouter>
  );
}

// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { isHerbal, isHamsini } from "./config/projectConfig";
// import { useAuth } from "./auth/AuthContext";

// import ProtectedRoute from "./auth/ProtectedRoute";
// import PublicRoute from "./auth/PublicRoute";
// import { Toaster } from "react-hot-toast";

// import DashboardLayout from "./layouts/DashboardLayout";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Products from "./pages/Products";
// import Employees from "./pages/Employees";
// import ComingSoon from "./pages/ComingSoon";
// import Category from "./pages/Category";
// import Brands from "./pages/brands/Brands";
// import OrdersPage from "./pages/OrdersPage";
// import OrderDetail from "./pages/OrderDetail";
// import POS from "./pos/POS";
// import POSOrders from "./pages/POSOrders";
// import POSOrderView from "./pages/POSOrderView";
// import CustomerCombinedReport from "./pages/CustomerCombinedReport";
// import StaffAttendanceCalendar from "./pages/StaffAttendanceCalendar";
// import AddCategory from "./pages/AddCategory";
// import CustomerManagement from "./pages/CustomerManagement";
// import CustomerOrders from "./pages/CustomerOrders";
// import ManualOrderDetails from "./pages/ManualOrderDetails";
// import ManualOrders from "./pages/ManualOrders";
// import ManualOrders1 from "./pages/ManualOrders1";
// import MyAttendance from "./pages/MyAttendance";

// import SettingsPage from "./pages/settings/SettingsPage";
// import ProfileSettings from "./pages/settings/components/ProfileSettings";
// import LogoSettings from "./pages/settings/components/LogoSettings";
// import SocialMediaSettings from "./pages/settings/components/SocialMediaSettings";
// import PaymentGatewaySettings from "./pages/settings/components/PaymentGatewaySettings";
// import VariationSettings from "./pages/settings/components/VariationSettings";
// import WhatsAppIntegrationSettings from "./pages/settings/components/WhatsAppIntegrationSettings";
// import CouponSettings from "./pages/settings/components/CouponSettings";
// import BannerSettings from "./pages/settings/components/BannerSettings";

// import BrandProtectedRoute from "./auth/BrandProtectedRoute";

// function AppRoutes() {
//   const { user } = useAuth();
//   const role = user?.role;

//   return (
//     <Routes>
//       {/* PUBLIC */}
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <Login />
//           </PublicRoute>
//         }
//       />

//       {/* PROTECTED */}
//       <Route
//         element={
//           <ProtectedRoute>
//             <DashboardLayout />
//           </ProtectedRoute>
//         }
//       >
//         {/* EMPLOYEE */}
//         {role === "employee" && (
//           <>
//             <Route path="/pos" element={<POS />} />
//             <Route path="/pos/orders" element={<ManualOrders1 />} />
//             <Route path="/calling/order/:id" element={<ManualOrderDetails />} />
//             <Route path="/customers" element={<CustomerManagement />} />
//             <Route path="/pos/orders/:id" element={<POSOrderView />} />
//             <Route path="/staff-attendance" element={<MyAttendance />} />
//             <Route path="*" element={<Navigate to="/pos" replace />} />
//           </>
//         )}

//         {/* ADMIN */}
//         {role === "admin" && (
//           <>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/products" element={<Products />} />
//             <Route path="/employees" element={<Employees />} />
//             <Route path="/orders" element={<POSOrders />} />
//             <Route path="/orders/:id" element={<OrderDetail />} />
//             <Route path="/brands" element={<Brands />} />

//             <Route path="/settings" element={<SettingsPage />}>
//               <Route path="profile" element={<ProfileSettings />} />
//               <Route path="logo" element={<LogoSettings />} />
//               <Route path="social-media" element={<SocialMediaSettings />} />
//               <Route
//                 path="payment-gateway"
//                 element={<PaymentGatewaySettings />}
//               />
//               <Route
//                 path="variation-settings"
//                 element={<VariationSettings />}
//               />
//               <Route
//                 path="whatsapp-integration"
//                 element={<WhatsAppIntegrationSettings />}
//               />
//               <Route path="coupons-settings" element={<CouponSettings />} />
//               <Route path="banner-settings" element={<BannerSettings />} />
//             </Route>
//           </>
//         )}
//       </Route>

//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Toaster position="top-right" reverseOrder={false} />
//       <AppRoutes />
//     </BrowserRouter>
//   );
// }
