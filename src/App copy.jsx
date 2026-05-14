import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { isHerbal, isHamsini } from "./config/projectConfig";

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

/* MASTER DATA */
import Category from "./pages/Category";
import Brands from "./pages/brands/Brands";

/* JOB CARDS */
import JewelleryJobCard from "./pages/JewelleryJobCard";
import GemStoneJobCard from "./pages/GemStoneJobCard";
import DimondJobCard from "./pages/DimondJobCard";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import POS from "./pos/POS";

/* SETTINGS */
import SettingsPage from "./pages/settings/SettingsPage";
import ProfileSettings from "./pages/settings/components/ProfileSettings";
import LogoSettings from "./pages/settings/components/LogoSettings";
import SocialMediaSettings from "./pages/settings/components/SocialMediaSettings";
import PaymentGatewaySettings from "./pages/settings/components/PaymentGatewaySettings";
import VariationSettings from "./pages/settings/components/VariationSettings";
import WhatsAppIntegrationSettings from "./pages/settings/components/WhatsAppIntegrationSettings";
import CouponSettings from "./pages/settings/components/CouponSettings";

/* INVOICES */
import PrintReceipt from "./pages/PrintReceipt";
import POSOrders from "./pages/POSOrders";
import POSOrderView from "./pages/POSOrderView";
import InvoiceCashMemoList from "./pages/InvoiceCashMemoList";
import InvoicePrint from "./pages/InvoicePrint";
import InvoiceWithLogoPrint from "./pages/InvoiceWithLogoPrint";
import ExtraCharges from "./pages/ExtraCharges";
import CashMemoPrint from "./pages/CashMemoPrint";
import RateCard from "./pages/RateCard";

/* CONFIRMATION */
import Confirmation from "./pages/Confirmation";
import ConfirmationList from "./pages/ConfirmationList";
import JobConfirmation from "./pages/JobConfirmation";
import ConfirmationPrint from "./pages/ConfirmationPrint";

/* AUTH PAGES */
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";

/* CONTEXT PROVIDERS */
import { LogoSettingsProvider } from "./context/LogoSettingsContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";

/* BRAND PROTECTED ROUTE */
import BrandProtectedRoute from "./auth/BrandProtectedRoute";
import CustomerCombinedReport from "./pages/CustomerCombinedReport";
import StaffComponent from "./pages/StaffComponent";
import StaffAddComponent from "./pages/StaffAddComponent";
import StaffAttendanceCalendar from "./pages/StaffAttendanceCalendar";
import ContactSettings from "./pages/settings/components/ContactSettings";
import CustomerCareSettings from "./pages/settings/components/CustomerCareSettings";
import AddCategory from "./pages/AddCategory";
import CustomerManagement from "./pages/CustomerManagement";
import ManualOrderDetails from "./pages/ManualOrderDetails";
import ManualOrders from "./pages/ManualOrders";
import CustomerOrders from "./pages/CustomerOrders";
import PermissionManagement from "./pages/PermissionManagement";
import BannerSettings from "./pages/settings/components/BannerSettings";
import ShippingSettings from "./pages/settings/components/ShippingSettings";
import BannerAdmin from "./pages/settings/components/BannerAdmin";
import EditProductSections from "./pages/settings/components/EditProductSections";
import SectionManager from "./pages/SectionManager";
import SectionList from "./pages/admin/section/SectionList";
import SectionForm from "./pages/admin/section/SectionForm";
import SectionDragDrop from "./pages/admin/section/SectionDragDrop";
import BlogForm from "./pages/admin/blog/BlogForm";
import BlogDragDrop from "./pages/admin/blog/BlogDragDrop";
import BlogList from "./pages/admin/blog/BlogList";
import CategoryForm from "./pages/CategoryForm";
import BlogCategoryForm from "./pages/admin/blog-category/CategoryForm";
import CategoryList from "./pages/admin/blog-category/CategoryList";
import PageList from "./pages/admin/pages/PageList";

export default function App() {


  const user = JSON.parse(localStorage.getItem("user"));
const role = user?.role;


  return (
    <BrowserRouter>
      <LogoSettingsProvider>
        <ProfileProvider>
          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            {/* ---------------- PUBLIC ---------------- */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <PublicRoute>
                  <VerifyOtp />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* ---------------- PROTECTED ---------------- */}

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* DEFAULT AFTER LOGIN */}

              

              {isHerbal && (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/add-categories" element={<AddCategory />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/customers" element={<CustomerManagement />} />
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

                  {/* <Route
                    path="/product-sections"
                    element={<SectionManager />}
                  /> */}

                  <Route path="/settings" element={<SettingsPage />}>
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="logo" element={<LogoSettings />} />
                    <Route
                      path="social-media"
                      element={<SocialMediaSettings />}
                    />
                    <Route path="contact-page" element={<ContactSettings />} />
                    <Route
                      path="customer-care-settings"
                      element={<CustomerCareSettings />}
                    />
                    <Route
                      path="payment-gateway"
                      element={<PaymentGatewaySettings />}
                    />

                    <Route
                      path="shipping-settings"
                      element={<ShippingSettings />}
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
                      path="product-sections"
                      element={<SectionManager />}
                    />
                  </Route>

                  <Route path="/online-orders" element={<OrdersPage />} />
                </>
              )}

              {isHamsini && (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/categories" element={<Category />} />

                  <Route
                    path="/staff-attendance"
                    element={<StaffAttendanceCalendar />}
                  />

                  {/* <Route path="/admin/sections" element={<SectionList />} />
                <Route path="/admin/sections/create" element={<SectionForm />} />
                <Route path="/admin/sections/edit/:id" element={<SectionForm />} />
                <Route path="/admin/sections/reorder" element={<SectionDragDrop />} /> */}

                    {/* <Route path="/admin/blog-categories" element={<CategoryList />} />
                <Route path="/admin/blog-categories/create" element={<BlogCategoryForm />} />
                <Route path="/admin/blog-categories/edit/:id" element={<BlogCategoryForm />} /> */}
           



                 {/* <Route path="/admin/blogs" element={<BlogList  />} />
                <Route path="/admin/blog/create" element={<BlogForm />} />
                <Route path="/admin/blog/edit/:id" element={<BlogForm />} />
             */}

                  {/* <Route
                    path="/product-sections"
                    element={<SectionManager />}
                  /> */}

                  <Route path="/settings" element={<SettingsPage />}>
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="logo" element={<LogoSettings />} />
                    <Route
                      path="social-media"
                      element={<SocialMediaSettings />}
                    />
                    <Route path="contact-page" element={<ContactSettings />} />
                    <Route
                      path="customer-care-settings"
                      element={<CustomerCareSettings />}
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
                      path="landing-banner-settings"
                      element={<BannerAdmin />}
                    />

                    <Route
                      path="product-sections"
                      element={<SectionManager />}
                    />
                    {/* Add in herbal also */}
                  
                      <Route path="footer-sections" element={<SectionList />} />
                      <Route path="footer-sections/reorder" element={<SectionDragDrop />} />


                      <Route path="blog-categories" element={<CategoryList />} />


                      <Route path="blogs" element={<BlogList  />} />
                      <Route path="pages" element={<PageList  />} />
               


                    
                  </Route>
                </>
              )}

              {/* DASHBOARD */}

              <Route path="/expenses" element={<ComingSoon />} />
              <Route path="/reports" element={<ComingSoon />} />

              <Route
                path="/brands"
                element={
                  <BrandProtectedRoute>
                    <Brands />
                  </BrandProtectedRoute>
                }
              />

              <Route path="/employees" element={<Employees />} />

              <Route path="/orders" element={<POSOrders />} />
              <Route path="/pos/orders/:id" element={<POSOrderView />} />

              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/users" element={<CustomerCombinedReport />} />
            </Route>

            {/* ---------------- FALLBACK ---------------- */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </ProfileProvider>
      </LogoSettingsProvider>
    </BrowserRouter>
  );
}
