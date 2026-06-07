import { Users, Package, ShoppingCart, TrendingUp, Filter, ArrowUp, ArrowDown, BarChart3, ClipboardList, DollarSign, MessageSquare, Warehouse, Eye } from "lucide-react";
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
import { Link } from "react-router-dom";
import useDynamicTitle from "../hooks/useDynamicTitle";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

// Dummy data for charts
const DUMMY_REVENUE_DATA = [
  { month: "Jan", revenue: 40000, profit: 12000 },
  { month: "Feb", revenue: 35000, profit: 10500 },
  { month: "Mar", revenue: 48000, profit: 15000 },
  { month: "Apr", revenue: 42000, profit: 13000 },
  { month: "May", revenue: 55000, profit: 17500 },
  { month: "Jun", revenue: 52000, profit: 16000 },
  { month: "Jul", revenue: 58000, profit: 18500 },
  { month: "Aug", revenue: 62000, profit: 20000 },
  { month: "Sep", revenue: 59000, profit: 19000 },
  { month: "Oct", revenue: 64000, profit: 21000 },
  { month: "Nov", revenue: 68000, profit: 22000 },
  { month: "Dec", revenue: 72000, profit: 24000 },
];

const DUMMY_ORDER_DATA = [
  { day: "Mon", orders: 45, completed: 38, cancelled: 3 },
  { day: "Tue", orders: 52, completed: 45, cancelled: 4 },
  { day: "Wed", orders: 38, completed: 32, cancelled: 2 },
  { day: "Thu", orders: 65, completed: 58, cancelled: 5 },
  { day: "Fri", orders: 58, completed: 50, cancelled: 4 },
  { day: "Sat", commands: 72, completed: 62, cancelled: 6 },
  { day: "Sun", orders: 48, completed: 42, cancelled: 3 },
];

const DUMMY_STATUS_DISTRIBUTION = [
  { name: "Pending", value: 45 },
  { name: "Processing", value: 80 },
  { name: "Shipped", value: 60 },
  { name: "Delivered", value: 200 },
  { name: "Cancelled", value: 25 },
];

const DASHBOARD_LINKS = [
  { path: "/dashboard/orders", label: "Orders", icon: ClipboardList, color: "from-indigo-500 to-purple-600" },
  { path: "/dashboard/products", label: "Products", icon: Package, color: "from-emerald-500 to-teal-600" },
  { path: "/dashboard/customers", label: "Customers", icon: Users, color: "from-sky-500 to-blue-600" },
  { path: "/dashboard/pos", label: "POS", icon: ShoppingCart, color: "from-amber-500 to-orange-600" },
  { path: "/dashboard/staff", label: "Staff", icon: BarChart3, color: "from-cyan-500 to-teal-600" },
  { path: "/dashboard/revenue", label: "Revenue", icon: DollarSign, color: "from-green-500 to-emerald-600" },
  { path: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageSquare, color: "from-green-600 to-emerald-500" },
  { path: "/dashboard/inventory", label: "Inventory", icon: Warehouse, color: "from-yellow-500 to-amber-600" },
];

export default function Dashboard() {
  useDynamicTitle("Dashboard");

  const { can } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    pending_orders: 0,
    today_orders: 0,
    monthly_growth: 0,
    avg_order_value: 0,
  });

  const [revenueData, setRevenueData] = useState(DUMMY_REVENUE_DATA);
  const [orderData, setOrderData] = useState(DUMMY_ORDER_DATA);
  const [statusData, setStatusData] = useState(DUMMY_STATUS_DISTRIBUTION);

  /* ================= FETCH API ================= */
  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          customers: data.customers || 0,
          products: data.products || 0,
          orders: data.orders || 0,
          revenue: parseFloat(data.revenue) || 0,
          pending_orders: data.pending_orders || 0,
          today_orders: data.today_orders || 0,
          monthly_growth: parseFloat(data.monthly_growth) || 0,
          avg_order_value: parseFloat(data.avg_order_value) || 0,
        });

        // Revenue Chart
        const formattedRevenue = data.revenue_chart && data.revenue_chart.length > 0
          ? data.revenue_chart.map((item) => ({
              month: item.month,
              revenue: parseFloat(item.revenue),
              profit: parseFloat(item.profit) || 0,
            }))
          : DUMMY_REVENUE_DATA;
        setRevenueData(formattedRevenue);

        // Orders Chart
        const formattedOrders = data.orders_chart && data.orders_chart.length > 0
          ? data.orders_chart
          : DUMMY_ORDER_DATA;
        setOrderData(formattedOrders);

        // Status Distribution
        const formattedStatus = data.status_distribution && data.status_distribution.length > 0
          ? data.status_distribution
          : DUMMY_STATUS_DISTRIBUTION;
        setStatusData(formattedStatus);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.view")) {
    return <AccessDenied />;
  }

  const formatCurrency = (value) => `₹${value.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xl">✕</button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Updating dashboard data...</span>
        </div>
      )}

      {/* Header with Welcome Banner */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back 👋</h1>
            <p className="text-slate-300 text-lg">Here's what's happening with your business today</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Eye size={14} /> Today's Orders: <strong className="text-white">{stats.today_orders}</strong></span>
              <span className="flex items-center gap-1"><TrendingUp size={14} /> Monthly Growth: <strong className="text-white">{stats.monthly_growth}%</strong></span>
            </div>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">📊</div>
        </div>
      </div>

      {/* Quick Navigation to Sub-Dashboards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Quick Access Dashboards</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {DASHBOARD_LINKS.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`bg-gradient-to-br ${link.color} rounded-xl p-3 text-white text-center hover:shadow-lg hover:scale-105 transition-all duration-200`}
            >
              <link.icon size={20} className="mx-auto mb-1" />
              <span className="text-[10px] font-medium block">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => fetchDashboard(startDate, endDate)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Top Stats - Now with 8 cards in 2 rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Customers" value={stats.customers.toLocaleString()} change="+8.2%" trend="up" icon="👥" color="blue" delay={0} />
        <StatCard title="Total Products" value={stats.products.toLocaleString()} change="+5.7%" trend="up" icon="📦" color="cyan" delay={100} />
        <StatCard title="Total Orders" value={stats.orders.toLocaleString()} change="+12.3%" trend="up" icon="📋" color="orange" delay={200} />
        <StatCard title="Total Revenue" value={formatCurrency(stats.revenue)} change="+15.8%" trend="up" icon="💰" color="green" delay={300} />
        <StatCard title="Pending Orders" value={stats.pending_orders.toLocaleString()} change="+3.2%" trend="up" icon="⏳" color="yellow" delay={400} />
        <StatCard title="Today's Orders" value={stats.today_orders.toLocaleString()} change="+22.5%" trend="up" icon="📅" color="purple" delay={500} />
        <StatCard title="Avg. Order Value" value={formatCurrency(stats.avg_order_value)} change="+4.1%" trend="up" icon="📊" color="teal" delay={600} />
        <StatCard title="Monthly Growth" value={`${stats.monthly_growth}%`} change="+2.3%" trend="up" icon="🚀" color="rose" delay={700} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart - Larger */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-500 mt-1">Monthly revenue & profit trends</p>
            </div>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#revenueGrad)" dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="none" dot={{ fill: "#22c55e", r: 3 }} isAnimationActive={true} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Status</h3>
            <p className="text-xs text-gray-500 mb-6">Distribution by order status</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
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
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart - Weekly Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Orders Overview</h3>
            <p className="text-xs text-gray-500 mt-1">Daily order comparison (completed vs total)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Total Orders" isAnimationActive={true} animationDuration={800} />
            <Bar dataKey="completed" fill="#22c55e" radius={[6, 6, 0, 0]} name="Completed" isAnimationActive={true} animationDuration={800} />
            <Bar dataKey="cancelled" fill="#ef4444" radius={[6, 6, 0, 0]} name="Cancelled" isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats Cards - More detailed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-2">Conversion Rate</p>
              <p className="text-4xl font-bold">48.2%</p>
            </div>
            <div className="text-5xl opacity-20">📈</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <ArrowUp size={14} />
              <span className="text-sm font-bold">+5.8%</span>
            </div>
            <span className="text-xs text-teal-100">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Avg. Response Time</p>
              <p className="text-4xl font-bold">2.4 hrs</p>
            </div>
            <div className="text-5xl opacity-20">⏱️</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <ArrowDown size={14} />
              <span className="text-sm font-bold">-12.5%</span>
            </div>
            <span className="text-xs text-blue-100">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Customer Satisfaction</p>
              <p className="text-4xl font-bold">4.5 ⭐</p>
            </div>
            <div className="text-5xl opacity-20">⭐</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <ArrowUp size={14} />
              <span className="text-sm font-bold">+0.3</span>
            </div>
            <span className="text-xs text-purple-100">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-2">Repeat Customers</p>
              <p className="text-4xl font-bold">42%</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <ArrowUp size={14} />
              <span className="text-sm font-bold">+6.2%</span>
            </div>
            <span className="text-xs text-rose-100">vs last month</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.customers.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <ArrowUp size={12} />
              <span>+8.2% this month</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.orders.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <ArrowUp size={12} />
              <span>+12.3% this month</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <ArrowUp size={12} />
              <span>+15.8% this month</span>
            </div>
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
    blue: "bg-blue-50 border-blue-200",
    cyan: "bg-cyan-50 border-cyan-200",
    orange: "bg-orange-50 border-orange-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    purple: "bg-purple-50 border-purple-200",
    teal: "bg-teal-50 border-teal-200",
    rose: "bg-rose-50 border-rose-200",
  };

  const trendColors = {
    blue: "text-blue-600",
    cyan: "text-cyan-600",
    orange: "text-orange-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
    teal: "text-teal-600",
    rose: "text-rose-600",
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