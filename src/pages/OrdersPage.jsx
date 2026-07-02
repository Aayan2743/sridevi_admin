import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";
import ShippingProviderModal from "./ShippingProviderModal";
import Swal from "sweetalert2";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function OrdersPage() {
  const { can } = useAuth();
  const [shippingModal, setShippingModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [xpressRates, setXpressRates] = useState([]);

  const [dimensionsModal, setDimensionsModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [packageDimensions, setPackageDimensions] = useState({
    weight: 500,
    length: 10,
    breadth: 10,
    height: 10,
  });

  const [shippingProcessing, setShippingProcessing] = useState(false);

  const [localOpen, setLocalOpen] = useState(false);

  const [localSaving, setLocalSaving] = useState(false);

  const [rateLoadingId, setRateLoadingId] = useState(null);

  const [localCourier, setLocalCourier] = useState({
    partner: "",
    awb: "",
    tracking_url: "",
    shipping_amount: "",
  });

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [pagination, setPagination] = useState({
    totalPages: 1,
  });

  const statusPill = (status) => {
    const map = {
      placed: "bg-slate-100 text-slate-700",
      // bill_sent: "bg-indigo-100 text-indigo-700",
      ready: "bg-amber-100 text-amber-700",
      in_transit: "bg-blue-100 text-blue-700",
      completed: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-rose-100 text-rose-700",
    };
    return map[status] || "bg-slate-100 text-slate-700";
  };

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/cart/online-orders", {
        params: {
          status: activeTab,
          search,
          page,
          perPage,
        },
      });
      console.log("ORDERS LOAD RESPONSE:", res.data.data);

      setOrders(res.data.data || []);
      setPagination(res.data.pagination || { totalPages: 1 });
    } catch (err) {
      console.error("ORDERS LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD STATS ================= */
  const loadStats = async () => {
    try {
      const res = await api.get("/cart/online-orders/stats");
      setStats(res.data.data || {});
    } catch (err) {
      console.error("STATS LOAD ERROR:", err);
    }
  };

  const loadStatusCounts = async () => {
    try {
      const res = await api.get("/cart/online-orders/status-counts");
      setStatusCounts(res.data.data || {});
    } catch (err) {
      console.error("COUNT LOAD ERROR:", err);
    }
  };
  const changeOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/cart/online-orders/${orderId}/status`, {
        order_status: status,
      });

      // reload orders after update
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    }
  };

  const handleShippingProvider = async (provider) => {
    setShippingModal(false);

    setSelectedProvider(provider);

    setPackageDimensions({
      weight: 500,
      length: 10,
      breadth: 10,
      height: 10,
    });

    setDimensionsModal(true);
  };

  const proceedWithShipping = async () => {
    const provider = selectedProvider;
    const dims = packageDimensions;

    if (provider === "local") {
      setDimensionsModal(false);
      setLocalOpen(true);
      return;
    }

    setShippingProcessing(true);
    try {
      const res = await api.post(
        `/admin-dashboard/orders/${selectedOrderId}/shipping-online`,
        {
          shipping_provider: provider,
          package_weight: dims.weight,
          package_length: dims.length,
          package_breadth: dims.breadth,
          package_height: dims.height,
        },
      );

      Swal.fire({
        icon: "success",
        title: "Shipping Successful",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
      loadOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Shipping Failed",
        text: err.response?.data?.message || "Shipping failed",
      });
    } finally {
      setDimensionsModal(false);
      setShippingProcessing(false);
    }
  };

  const saveLocalCourier = async () => {
    setLocalSaving(true);

    try {
      await api.post(
        `/admin-dashboard/orders/${selectedOrderId}/shipping-online`,
        {
          shipping_provider: "local",
          courier_partner: localCourier.partner,
          awb_number: localCourier.awb,
          tracking_url: localCourier.tracking_url,
          shipping_amount: localCourier.shipping_amount,
          package_weight: packageDimensions.weight,
          package_length: packageDimensions.length,
          package_breadth: packageDimensions.breadth,
          package_height: packageDimensions.height,
        },
      );

      Swal.fire({
        icon: "success",
        title: "Shipping Saved",
        timer: 2000,
        showConfirmButton: false,
      });

      setLocalOpen(false);
      loadOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save shipping",
      });
    } finally {
      setLocalSaving(false);
    }
  };

  const getXpressCouriers = async () => {
    try {
      const res = await api.get("/admin-dashboard/xpressbees/couriers");

      console.log(res.data);

      setXpressRates(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const cancelShipment = async (shippingId) => {
    const confirmed = await Swal.fire({
      title: "Cancel this shipment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "No",
    });
    if (!confirmed.isConfirmed) return;

    setCancellingId(shippingId);
    try {
      const res = await api.post(
        `/admin-dashboard/shipping/${shippingId}/cancel-online`,
      );

      Swal.fire({
        icon: "success",
        title: "Cancelled",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
      loadOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to cancel shipment",
      });
    } finally {
      setCancellingId(null);
    }
  };

  /* ================= GET SHIPMOZO RATE ================= */
  const getShipmozoRate = async (shippingId) => {
    setRateLoadingId(shippingId);
    try {
      const res = await api.post(
        `/admin-dashboard/shipmozo/rate/online/${shippingId}`,
      );

      const rates = res.data.data?.data ?? [];

      if (rates.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Rates Available",
          text: "No shipping rates found for this order.",
          confirmButtonText: "OK",
        });
        return;
      }

      const PER_PAGE = 5;
      let currentPage = 1;
      const totalPages = Math.ceil(rates.length / PER_PAGE);

      const renderTable = (page) => {
        const start = (page - 1) * PER_PAGE;
        const end = start + PER_PAGE;
        const pageRates = rates.slice(start, end);

        const rows = pageRates
          .map(
            (r) => `
              <tr class="${start % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                <td class="p-2 border-b text-xs">
                  <div class="flex items-center gap-2">
                    ${r.image ? `<img src="${r.image}" alt="${r.name}" class="w-6 h-6 rounded object-contain" />` : ""}
                    <span class="font-medium">${r.name || "-"}</span>
                  </div>
                </td>
                <td class="p-2 border-b text-xs text-center">${r.estimated_delivery || "-"}</td>
                <td class="p-2 border-b text-xs text-right">₹${Number(r.shipping_charges || 0).toFixed(2)}</td>
                <td class="p-2 border-b text-xs text-right">₹${Number(r.gst || 0).toFixed(2)}</td>
                <td class="p-2 border-b text-xs text-right font-semibold">₹${Number(r.total_charges || 0).toFixed(2)}</td>
                <td class="p-2 border-b text-xs text-center">${r.minimum_chargeable_weight || "-"}</td>
                <td class="p-2 border-b text-xs text-center">
                  <button onclick="Swal.clickConfirm()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-2 py-1 rounded assign-btn" data-courier="${r.id}">
                    Assign
                  </button>
                </td>
              </tr>
            `,
          )
          .join("");

        const pagination = `
            <div class="flex justify-between items-center mt-3 text-xs">
              <span class="text-gray-500">Page ${page} of ${totalPages}</span>
              <div class="flex gap-2">
                <button onclick="window.__swalPrevPage()" class="px-3 py-1 border rounded hover:bg-gray-100 ${page <= 1 ? "opacity-40 pointer-events-none" : ""}">Prev</button>
                <button onclick="window.__swalNextPage()" class="px-3 py-1 border rounded hover:bg-gray-100 ${page >= totalPages ? "opacity-40 pointer-events-none" : ""}">Next</button>
              </div>
            </div>
          `;

        return `
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="p-2 text-xs font-semibold border-b">Courier</th>
                    <th class="p-2 text-xs font-semibold border-b text-center">Delivery</th>
                    <th class="p-2 text-xs font-semibold border-b text-right">Shipping</th>
                    <th class="p-2 text-xs font-semibold border-b text-right">GST</th>
                    <th class="p-2 text-xs font-semibold border-b text-right">Total</th>
                    <th class="p-2 text-xs font-semibold border-b text-center">Min Weight</th>
                    <th class="p-2 text-xs font-semibold border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
              ${totalPages > 1 ? pagination : ""}
            </div>
          `;
      };

      const swal = Swal.fire({
        icon: "success",
        title: `Shipping Rates (${rates.length})`,
        width: 950,
        html: renderTable(currentPage),
        confirmButtonText: "Close",
        didOpen: () => {
          document.querySelectorAll(".assign-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const courierId = btn.dataset.courier;

              await assignShipmozoCourier(shippingId, courierId);

              Swal.close();
            });
          });
        },
        willClose: () => {
          delete window.__swalPrevPage;
          delete window.__swalNextPage;
        },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Rate Fetch Failed",
        text: err.response?.data?.message || "Could not fetch shipping rate",
      });
    } finally {
      setRateLoadingId(null);
    }
  };

  const assignShipmozoCourier = async (shippingId, courierId) => {
    try {
      const res = await api.post(
        `/admin-dashboard/shipmozo/assign-courier/online/${shippingId}`,
        {
          courier_id: courierId,
        },
      );

      Swal.fire({
        icon: "success",
        title: "Courier Assigned",
        text: res.data.message,
      });

      loadOrders();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: err.response?.data?.message || "Failed to assign courier",
      });
    }
  };

  useEffect(() => {
    loadOrders();
    loadStats();
    loadStatusCounts();
  }, [activeTab, search, page]);

  if (!can("online_orders.view")) {
    return <AccessDenied />;
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Orders
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage online orders, track status, and update fulfillment
                quickly.
              </p>
            </div>

            <button className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 md:flex">
              <span>Today</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Order report
            </button>
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
              Create a manual order
            </button>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total orders" value={stats.totalOrders || 0} />
        <Stat title="Total revenue" value={`₹${stats.totalRevenue || 0}`} />
        <Stat title="Total pending orders" value={stats.pendingOrders || 0} />
        <Stat
          title="Total completed orders"
          value={stats.completedOrders || 0}
        />
      </div>

      {/* ================= TABS ================= */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              ["all", "All"],
              ["bill_sent", "Bill Sent"],
              ["ready", "Ready To Pick"],
              ["in_transit", "In Transit"],
              ["completed", "Completed"],
              ["others", "Others"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setPage(1);
                }}
                className={`inline-flex items-center rounded-full px-3 py-1.5 transition
        ${
          activeTab === key
            ? "bg-indigo-100 font-medium text-indigo-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
              >
                {label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs
          ${
            activeTab === key
              ? "bg-indigo-200 text-indigo-800"
              : "bg-white text-slate-600"
          }`}
                >
                  {statusCounts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search order..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Affiliate Name</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Order type</th>
                <th className="px-4 py-3 text-left">Order status</th>
                <th className="px-4 py-3 text-left">Shipping</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-left">Payment mode</th>
                <th className="px-4 py-3 text-left">Payment status</th>
                <th className="px-4 py-3 text-left">View</th>
                <th className="px-4 py-3 text-left">Update</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="12" className="py-10 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="12" className="py-10 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              )}

              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3">{o.user?.phone || "-"}</td>

                  <td className="px-4 py-3">
                    {o.affiliate?.user?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    ₹{o.total_amount}
                  </td>
                  <td className="px-4 py-3">Self Billed</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(o.order_status || "placed")}`}
                    >
                      {(o.order_status || "placed").toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {o.shipping ? (
                      <div className="space-y-1">
                        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          {o.shipping.shipping_provider?.toUpperCase()}
                        </span>

                        <div className="text-xs text-slate-600">
                          AWB: {o.shipping.awb || "-"}
                        </div>
                      </div>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600">
                        Not Shipped
                      </span>
                    )}

                    {o.shipping?.shipment_status === "booked" &&
                      o.shipping?.shipping_provider === "shipmozo" && (
                        <button
                          onClick={() => getShipmozoRate(o.shipping.id)}
                          disabled={rateLoadingId === o.shipping.id}
                          className="w-full bg-purple-600 text-white text-[10px] px-1.5 py-1 rounded disabled:opacity-50 mt-1"
                        >
                          {rateLoadingId === o.shipping.id
                            ? "Fetching..."
                            : "Get Rate"}
                        </button>
                      )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {o.items?.length || 0}
                  </td>
                  <td className="px-4 py-3">{o.payment_method}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {o.payment_status}
                  </td>
                  {/* <td className="px-4 py-3 text-gray-500">{o.payment_status}</td> */}
                  <td className="px-4 py-3 text-slate-500">
                    <button
                      onClick={() => navigate(`/orders/${o.id}`)}
                      className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                    >
                      View
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    {o.shipping?.shipment_status === "booked" ? null : (
                      <button
                        onClick={() => {
                          setSelectedOrderId(o.id);
                          setShippingModal(true);
                        }}
                        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
                      >
                        Shipping
                      </button>
                    )}

                    {o.shipping?.shipment_status === "booked" &&
                      can("online_pos_orders.cancel shipping") && (
                        <button
                          onClick={() => cancelShipment(o.shipping.id)}
                          disabled={cancellingId === o.shipping.id}
                          className="mt-2 block w-full rounded bg-red-600 px-2 py-2 text-xs text-white disabled:opacity-50"
                        >
                          {cancellingId === o.shipping.id
                            ? "Cancelling..."
                            : "Cancel Shipment"}
                        </button>
                      )}

                    <select
                      value={o.order_status}
                      onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="placed">Placed</option>
                      <option value="bill_sent">Bill Sent</option>
                      <option value="ready">Ready To Pick</option>
                      <option value="in_transit">In Transit</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PACKAGE DIMENSIONS POPUP */}
          {dimensionsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">
                    Package Dimensions
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Enter package details for {selectedProvider?.toUpperCase()}
                  </p>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Weight (g)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={packageDimensions.weight}
                      onChange={(e) =>
                        setPackageDimensions({
                          ...packageDimensions,
                          weight: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Length (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={packageDimensions.length}
                      onChange={(e) =>
                        setPackageDimensions({
                          ...packageDimensions,
                          length: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Breadth (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={packageDimensions.breadth}
                      onChange={(e) =>
                        setPackageDimensions({
                          ...packageDimensions,
                          breadth: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={packageDimensions.height}
                      onChange={(e) =>
                        setPackageDimensions({
                          ...packageDimensions,
                          height: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={proceedWithShipping}
                    disabled={shippingProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {shippingProcessing ? "Processing..." : "Proceed"}
                  </button>

                  <button
                    onClick={() => setDimensionsModal(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 py-2.5 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {localOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="bg-orange-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white">
                    Local Courier Details
                  </h3>

                  <p className="mt-1 text-sm text-orange-100">
                    Enter shipping information for this order
                  </p>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Courier Partner
                    </label>

                    <input
                      value={localCourier.partner}
                      onChange={(e) =>
                        setLocalCourier({
                          ...localCourier,
                          partner: e.target.value,
                        })
                      }
                      placeholder="e.g. DTDC, Delhivery, Blue Dart"
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      AWB Number
                    </label>

                    <input
                      value={localCourier.awb}
                      onChange={(e) =>
                        setLocalCourier({
                          ...localCourier,
                          awb: e.target.value,
                        })
                      }
                      placeholder="Enter AWB / Tracking Number"
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Tracking URL
                    </label>

                    <input
                      value={localCourier.tracking_url}
                      onChange={(e) =>
                        setLocalCourier({
                          ...localCourier,
                          tracking_url: e.target.value,
                        })
                      }
                      placeholder="https://tracking.example.com"
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Shipping Amount
                    </label>

                    <input
                      type="number"
                      value={localCourier.shipping_amount}
                      onChange={(e) =>
                        setLocalCourier({
                          ...localCourier,
                          shipping_amount: e.target.value,
                        })
                      }
                      placeholder="Enter shipping amount"
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={saveLocalCourier}
                    disabled={localSaving}
                    className="flex-1 rounded-lg bg-orange-600 py-3 text-white"
                  >
                    {localSaving ? "Saving..." : "Save Courier"}
                  </button>

                  <button
                    onClick={() => setLocalOpen(false)}
                    className="flex-1 rounded-lg border py-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <ShippingProviderModal
            open={shippingModal}
            onClose={() => setShippingModal(false)}
            onSelect={handleShippingProvider}
          />
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-slate-600">
          Page {page} / {pagination.totalPages}
        </span>
        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

const Stat = ({ title, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {title}
    </p>
    <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
  </div>
);
