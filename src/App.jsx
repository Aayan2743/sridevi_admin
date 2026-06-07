import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute"; // 🔥 NEW
import { Toaster } from "react-hot-toast";

import DashboardLayout from "./layouts/DashboardLayout";

/* PAGES */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Employees from "./pages/Employees";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import POS from "./pos/POS";
import OnlinePOS from "./online-pos/POS";
import POSOrders from "./pages/POSOrders";
import POSOrderView from "./pages/POSOrderView";
import CustomerCombinedReport from "./pages/CustomerCombinedReport";
import StaffAttendanceCalendar from "./pages/StaffAttendanceCalendar";

import AddCategory from "./pages/AddCategory";
import CustomerManagement from "./pages/CustomerManagement";
import CustomerOrders from "./pages/CustomerOrders";
import ManualOrderDetails from "./pages/ManualOrderDetails";
import ManualOrders from "./pages/ManualOrders";
import OnlinePOSOrders from "./pages/OnlinePOSOrders";

import SettingsPage from "./pages/settings/SettingsPage";
import ProfileSettings from "./pages/settings/components/ProfileSettings";
import LogoSettings from "./pages/settings/components/LogoSettings";

import BulkVariantImages from "./pages/BulkVariantImages";
import OrdersDashboard from "./pages/dashboards/OrdersDashboard";
import ProductsDashboard from "./pages/dashboards/ProductsDashboard";
import CustomersDashboard from "./pages/dashboards/CustomersDashboard";
import POSDashboard from "./pages/dashboards/POSDashboard";
import StaffDashboard from "./pages/dashboards/StaffDashboard";
import RevenueDashboard from "./pages/dashboards/RevenueDashboard";
import WhatsAppDashboard from "./pages/dashboards/WhatsAppDashboard";
import InventoryDashboard from "./pages/dashboards/InventoryDashboard";
import BulkAddVariation from "./pages/BulkAddVariation";
import WhatsappChat from "./pages/WhatsappChat";
import CategorySorter from "./pos/components/CategorySorter";

/* RBAC */
import Roles from "./pages/RolesAndPermissions/Roles";
import RolePermission from "./pages/RolesAndPermissions/RolePermission";
import Permissions from "./pages/RolesAndPermissions/Permissions";
import AssignRole from "./pages/RolesAndPermissions/AssignRole";

import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperDashboard from "./pages/superadmin/Dashboard";
import SuperAdmins from "./pages/superadmin/Admins";
import SuperRoles from "./pages/superadmin/Roles";
import SuperModules from "./pages/superadmin/Modules";
import SuperSettings from "./pages/superadmin/Settings";

/* EXTRA */
import Unauthorized from "./pages/Unauthorized";
import InvoicePayment from "./pages/InvoicePayment";
import SuperAdminLoginUI from "./pages/SuperAdminLoginUI";
import { SuperAdminAuthProvider } from "./auth/SuperAdminAuthContext";
import SuperAdminRoute from "./auth/SuperAdminRoute";
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
import ComingSoon from "./pages/ComingSoon";
import SectionManager from "./pages/SectionManager";
import PosProducts from "./pages/PosProducts";
import BulkStoreVariantImages from "./pages/BulkStoreVariantImages";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/super-admin/login"
        element={
          <PublicRoute>
            <SuperAdminLoginUI />
          </PublicRoute>
        }
      />

      <Route
        path="/super-admin"
        element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
        }
      >
        <Route index element={<SuperDashboard />} />
        <Route path="admins" element={<SuperAdmins />} />
        <Route path="roles" element={<SuperRoles />} />
        <Route path="modules" element={<SuperModules />} />
        <Route path="settings" element={<SuperSettings />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* PROTECTED LAYOUT */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ================= DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            // <Dashboard />
            <PrivateRoute permission="dashboard.view">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ================= COMPATIBILITY DASHBOARDS ================= */}
        <Route
          path="/dashboard/orders"
          element={
            <PrivateRoute permission="dashboard.orders">
              <OrdersDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <PrivateRoute permission="dashboard.products">
              <ProductsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/customers"
          element={
            <PrivateRoute permission="dashboard.customers">
              <CustomersDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pos"
          element={
            <PrivateRoute permission="dashboard.pos">
              <POSDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/staff"
          element={
            <PrivateRoute permission="dashboard.staff">
              <StaffDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/revenue"
          element={
            <PrivateRoute permission="dashboard.revenue">
              <RevenueDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/whatsapp"
          element={
            <PrivateRoute permission="dashboard.whatsapp">
              <WhatsAppDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/inventory"
          element={
            <PrivateRoute permission="dashboard.inventory">
              <InventoryDashboard />
            </PrivateRoute>
          }
        />

        {/* ================= PRODUCTS ================= */}
        <Route
          path="/products"
          element={
            // <Products />
            <PrivateRoute permission="product.view">
              <Products />
            </PrivateRoute>
          }
        />

        <Route
          path="/pos/products"
          element={
            // <Products />
            <PrivateRoute permission="product.view">
              <PosProducts />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-bulk-variants"
          element={
            <BulkAddVariation />
            // <PrivateRoute permission="bulk_products">
            //   <BulkAddVariation />
            // </PrivateRoute>
          }
        />

        <Route
          path="/bulk-variant-images"
          element={
            // <BulkVariantImages />
            <PrivateRoute permission="varients.view">
              <BulkVariantImages />
            </PrivateRoute>
          }
        />

        <Route
          path="/bulk-variant-images-for-store-products"
          element={
            // <BulkVariantImages />
            <PrivateRoute permission="varients.view">
              <BulkStoreVariantImages />
            </PrivateRoute>
          }
        />

        {/* ================= CATEGORY ================= */}
        <Route
          path="/add-categories"
          element={
            <PrivateRoute permission="categories.view">
              <AddCategory />
            </PrivateRoute>
          }
        />

        {/* ================= POS ================= */}
        <Route
          path="/pos"
          element={
            <PrivateRoute permission="pos.view">
              <POS />
            </PrivateRoute>
          }
        />

        <Route
          path="/online-pos"
          element={
            <PrivateRoute permission="pos.view">
              <OnlinePOS />
            </PrivateRoute>
          }
        />

        <Route
          path="/pos/orders"
          element={
            <PrivateRoute permission="pos_orders.view">
              <ManualOrders />
            </PrivateRoute>
          }
        />

        <Route
          path="/online-pos-order"
          element={
            <PrivateRoute permission="online_pos_orders.view order details">
              <OnlinePOSOrders />
            </PrivateRoute>
          }
        />

        <Route path="/calling/order/:id" element={<ManualOrderDetails />} />

        <Route path="/pos/orders/:id" element={<POSOrderView />} />

        {/* ================= CUSTOMERS ================= */}
        <Route
          path="/customers"
          element={
            <PrivateRoute permission="customer_management.view">
              <CustomerManagement />
            </PrivateRoute>
          }
        />

        <Route path="/customers/:id/orders" element={<CustomerOrders />} />

        {/* ================= ORDERS ================= */}
        <Route
          path="/online-orders"
          element={
            <PrivateRoute permission="online_orders.view">
              <OrdersPage />
            </PrivateRoute>
          }
        />

        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* ================= USERS ================= */}
        <Route
          path="/users"
          element={
            // <PrivateRoute permission="view_users">
            <CustomerCombinedReport />
            // </PrivateRoute>
          }
        />

        <Route path="/employees" element={<Employees />} />

        {/* ================= ATTENDANCE ================= */}
        <Route
          path="/staff-attendance"
          element={
            <PrivateRoute permission="staff_attendance.view">
              <StaffAttendanceCalendar />
            </PrivateRoute>
          }
        />

        {/* ================= WHATSAPP ================= */}

        <Route
          path="/my-whatsapp"
          element={
            <PrivateRoute permission="whatsapp_agent.view">
              <WhatsappChat />
            </PrivateRoute>
          }
        />

        {/* <Route path="/my-whatsapp" element={<WhatsappChat />} /> */}

        {/* ================= CATEGORY SORT ================= */}

        <Route
          path="/category-sorter"
          element={
            <PrivateRoute permission="category_sorter.view">
              <CategorySorter />
            </PrivateRoute>
          }
        />

        {/* ================= RBAC ================= */}
        <Route
          path="/roles"
          element={
            <PrivateRoute permission="roles.view">
              <Roles />
            </PrivateRoute>
          }
        />

        {/* <Route
          path="/Add-Permissions"
          element={
            // <PrivateRoute permission="view_permissions">
            <Permissions />
            // </PrivateRoute>
          }
        /> */}

        <Route
          path="/assign-role"
          element={
            <PrivateRoute permission="assign_roles.view">
              <AssignRole />
            </PrivateRoute>
          }
        />

        <Route
          path="/role-permission/:role"
          element={
            // <PrivateRoute permission="view_permissions">
            <RolePermission />
            // </PrivateRoute>
          }
        />

        {/* ================= SETTINGS ================= */}
        <Route
          path="/settings"
          element={
            <PrivateRoute permission="settings.view">
              <SettingsPage />
            </PrivateRoute>
          }
        >
          <Route
            path="profile"
            element={
              <PrivateRoute permission="settings.profile">
                <ProfileSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="logo"
            element={
              <PrivateRoute permission="settings.logo">
                <LogoSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="social-media"
            element={
              <PrivateRoute permission="settings.socialmedia">
                <SocialMediaSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="payment-gateway"
            element={
              <PrivateRoute permission="settings.paymentgateway">
                <PaymentGatewaySettings />
              </PrivateRoute>
            }
          />

          <Route
            path="variation-settings"
            element={
              <PrivateRoute permission="settings.variationsettings">
                <VariationSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="whatsapp-integration"
            element={
              <PrivateRoute permission="settings.whatsAppintegration">
                <WhatsAppIntegrationSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="coupons-settings"
            element={
              <PrivateRoute permission="settings.couponsettings">
                <CouponSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="banner-settings"
            element={
              <PrivateRoute permission="settings.bannersettings">
                <BannerSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="contact-page"
            element={
              <PrivateRoute permission="settings.contactsettings">
                <ContactSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="customer-care-settings"
            element={
              <PrivateRoute permission="settings.customercare">
                <CustomerCareSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="shipping-settings"
            element={
              <PrivateRoute permission="settings.shippingproviders">
                <ShippingSettings />
              </PrivateRoute>
            }
          />

          <Route
            path="product-sections"
            element={
              <PrivateRoute permission="settings.product_section_view">
                <SectionManager />
              </PrivateRoute>
            }
          />

          {/* <Route
    path="footer-sections"
    element={
      <PrivateRoute permission="settings.footer_sections">
        <ProductSectionAssign />
      </PrivateRoute>
    }
  /> */}

          {/* <Route
    path="footer-sections/reorder"
    element={
      <PrivateRoute permission="settings.footer_reorder">
        <ProductSectionAssign />
      </PrivateRoute>
    }
  /> */}

          {/* <Route
    path="pages"
    element={
      <PrivateRoute permission="settings.pages">
        <ProductSectionAssign />
      </PrivateRoute>
    }
  /> */}

          {/* <Route
    path="blog-categories"
    element={
      <PrivateRoute permission="settings.blog_categories">
        <ComingSoon />
      </PrivateRoute>
    }
  /> */}

          {/* <Route
    path="blogs"
    element={
      <PrivateRoute permission="settings.blogs">
        <ComingSoon />
      </PrivateRoute>
    }
  /> */}

          {/* <Route
    path="landing-banner-settings"
    element={
      <PrivateRoute permission="settings.landingbannersettings">
        <BannerSettings />
      </PrivateRoute>
    }
  /> */}
        </Route>
      </Route>

      {/* PUBLIC — Invoice Payment (no auth) */}
      <Route path="/pay/:token" element={<InvoicePayment />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SuperAdminAuthProvider>
        <Toaster />
        <AppRoutes />
      </SuperAdminAuthProvider>
    </BrowserRouter>
  );
}
