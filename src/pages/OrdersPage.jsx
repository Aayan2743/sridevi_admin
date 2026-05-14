

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import api from "../api/axios";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function OrdersPage() {

    const { can } = useAuth();


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
      bill_sent: "bg-indigo-100 text-indigo-700",
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

  useEffect(() => {
    loadOrders();
    loadStats();
    loadStatusCounts();
  }, [activeTab, search, page]);


  
   if (!can("online_orders.view")) {
    return (
      <AccessDenied />
    );
  }


  /* ================= UI ================= */
  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Orders</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage online orders, track status, and update fulfillment quickly.
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
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Order type</th>
              <th className="px-4 py-3 text-left">Order status</th>
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
              <tr key={o.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">#{o.id}</td>
                <td className="px-4 py-3">{o.user?.phone || "-"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  ₹{o.total_amount}
                </td>
                <td className="px-4 py-3">Self Billed</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(o.order_status || "placed")}`}>
                  {(o.order_status || "placed").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {o.items?.length || 0}
                </td>
                <td className="px-4 py-3">{o.payment_method}</td>
                <td className="px-4 py-3 text-slate-500">{o.payment_status}</td>
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
                  <select
                    value={o.order_status}
                    onChange={(e) => changeOrderStatus(o.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
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
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
  </div>
);
