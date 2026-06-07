import { ShoppingCart, Clock, CheckCircle, XCircle, Filter, ArrowUp, ArrowDown } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../components/AccessDenied";

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

// Dummy data
const DUMMY_ORDER_TREND = [
  { month: "Jan", orders: 120, completed: 100, cancelled: 10 },
  { month: "Feb", orders: 150, completed: 130, cancelled: 12 },
  { month: "Mar", orders: 180, completed: 155, cancelled: 15 },
  { month: "Apr", orders: 220, completed: 200, cancelled: 18 },
  { month: "May", orders: 190, completed: 170, cancelled: 14 },
  { month: "Jun", orders: 250, completed: 230, cancelled: 16 },
];

const DUMMY_STATUS_DATA = [
  { name: "Pending", value: 45 },
  { name: "Processing", value: 80 },
  { name: "Shipped", value: 60 },
  { name: "Delivered", value: 200 },
  { name: "Cancelled", value: 25 },
];

const DUMMY_PAYMENT_METHODS = [
  { method: "COD", orders: 320 },
  { method: "Online", orders: 180 },
  { method: "Wallet", orders: 70 },
];

export default function OrdersDashboard() {
  useDynamicTitle("Orders Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_orders: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });

  const [orderTrend, setOrderTrend] = useState(DUMMY_ORDER_TREND);
  const [statusData, setStatusData] = useState(DUMMY_STATUS_DATA);
  const [paymentData, setPaymentData] = useState(DUMMY_PAYMENT_METHODS);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/orders-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_orders: data.total_orders || 0,
          pending: data.pending || 0,
          completed: data.completed || 0,
          cancelled: data.cancelled || 0,
          revenue: parseFloat(data.revenue) || 0,
        });

        setOrderTrend(
          data.order_trend && data.order_trend.length > 0
            ? data.order_trend
            : DUMMY_ORDER_TREND
        );

        setStatusData(
          data.status_distribution && data.status_distribution.length > 0
            ? data.status_distribution
            : DUMMY_STATUS_DATA
        );

        setPaymentData(
          data.payment_methods && data.payment_methods.length > 0
            ? data.payment_methods
            : DUMMY_PAYMENT_METHODS
        );
      } else {
        setError("Failed to load orders dashboard data");
      }
    } catch (error) {
      console.error("Orders dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch orders data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.orders")) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Orders Dashboard 📦</h1>
            <p className="text-indigo-200 text-lg">Track and manage your order performance</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">📦</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => fetchDashboard(startDate, endDate)}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.total_orders.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon="📋"
          color="indigo"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={stats.pending.toLocaleString()}
          change="+2.1%"
          trend="up"
          icon="⏳"
          color="yellow"
          delay={100}
        />
        <StatCard
          title="Completed"
          value={stats.completed.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon="✅"
          color="green"
          delay={200}
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled.toLocaleString()}
          change="-3.2%"
          trend="down"
          icon="❌"
          color="red"
          delay={300}
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          change="+9.8%"
          trend="up"
          icon="💰"
          color="teal"
          delay={400}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Orders Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderTrend}>
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              />
              <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fill="url(#orderGrad)" dot={{ fill: "#6366f1", r: 5 }} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} fill="none" dot={{ fill: "#22c55e", r: 3 }} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} fill="none" dot={{ fill: "#ef4444", r: 3 }} isAnimationActive={true} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paymentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="method" stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Avg. Order Value</p>
              <p className="text-4xl font-bold">₹1,245</p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowUp size={24} />
            </div>
            <span className="text-sm">+12% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-2">Avg. Delivery Time</p>
              <p className="text-4xl font-bold">3.2 days</p>
            </div>
            <div className="text-5xl opacity-20">🚚</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowDown size={24} />
            </div>
            <span className="text-sm">-8% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Return Rate</p>
              <p className="text-4xl font-bold">2.4%</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowDown size={24} />
            </div>
            <span className="text-sm">-1.2% vs last month</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

/* ========= STAT CARD ========= */
function StatCard({ title, value, change, trend, icon, color, delay }) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    teal: "bg-teal-50 border-teal-200",
  };

  const trendColors = {
    indigo: "text-indigo-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    red: "text-red-600",
    teal: "text-teal-600",
  };

  return (
    <div
      className={`rounded-2xl p-6 border ${colorClasses[color]} shadow-sm hover:shadow-md transition animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl animate-bounce" style={{ animationDelay: `${delay}ms` }}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>
      <div className="flex items-center gap-2">
        {trend === "up" ? (
          <ArrowUp size={16} className={trendColors[color]} />
        ) : (
          <ArrowDown size={16} className={trendColors[color]} />
        )}
        <span className={`text-sm font-semibold ${trendColors[color]}`}>{change}</span>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>
    </div>
  );
}