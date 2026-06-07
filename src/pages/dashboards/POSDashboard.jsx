import { ShoppingCart, Receipt, Users, TrendingUp, Filter, ArrowUp, ArrowDown } from "lucide-react";
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

const DUMMY_POS_TREND = [
  { day: "Mon", transactions: 45, revenue: 12500 },
  { day: "Tue", transactions: 52, revenue: 14800 },
  { day: "Wed", transactions: 38, revenue: 10200 },
  { day: "Thu", transactions: 65, revenue: 18500 },
  { day: "Fri", transactions: 58, revenue: 16200 },
  { day: "Sat", transactions: 72, revenue: 21000 },
  { day: "Sun", transactions: 48, revenue: 13500 },
];

const DUMMY_PAYMENT_TYPES = [
  { name: "Cash", value: 180 },
  { name: "Card", value: 120 },
  { name: "UPI", value: 95 },
  { name: "Wallet", value: 45 },
];

const DUMMY_HOURS = [
  { hour: "10AM", orders: 12 },
  { hour: "11AM", orders: 18 },
  { hour: "12PM", orders: 25 },
  { hour: "1PM", orders: 30 },
  { hour: "2PM", orders: 22 },
  { hour: "3PM", orders: 20 },
  { hour: "4PM", orders: 28 },
  { hour: "5PM", orders: 35 },
  { hour: "6PM", orders: 40 },
  { hour: "7PM", orders: 32 },
  { hour: "8PM", orders: 20 },
];

export default function POSDashboard() {
  useDynamicTitle("POS Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_transactions: 0,
    total_revenue: 0,
    avg_order_value: 0,
    total_customers: 0,
    items_sold: 0,
  });

  const [trendData, setTrendData] = useState(DUMMY_POS_TREND);
  const [paymentTypes, setPaymentTypes] = useState(DUMMY_PAYMENT_TYPES);
  const [hourlyData, setHourlyData] = useState(DUMMY_HOURS);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/pos-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_transactions: data.total_transactions || 0,
          total_revenue: parseFloat(data.total_revenue) || 0,
          avg_order_value: parseFloat(data.avg_order_value) || 0,
          total_customers: data.total_customers || 0,
          items_sold: data.items_sold || 0,
        });

        setTrendData(data.trend?.length > 0 ? data.trend : DUMMY_POS_TREND);
        setPaymentTypes(data.payment_types?.length > 0 ? data.payment_types : DUMMY_PAYMENT_TYPES);
        setHourlyData(data.hourly?.length > 0 ? data.hourly : DUMMY_HOURS);
      } else {
        setError("Failed to load POS dashboard data");
      }
    } catch (error) {
      console.error("POS dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch POS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.pos")) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xl">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-900 to-orange-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">POS Dashboard 🏪</h1>
            <p className="text-amber-200 text-lg">Point of Sale real-time analytics</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">🏪</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
            </div>
          </div>
          <button onClick={() => fetchDashboard(startDate, endDate)} disabled={loading} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Transactions" value={stats.total_transactions.toLocaleString()} change="+7.5%" trend="up" icon="🧾" color="amber" delay={0} />
        <StatCard title="Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} change="+11.2%" trend="up" icon="💰" color="green" delay={100} />
        <StatCard title="Avg. Order Value" value={`₹${stats.avg_order_value.toLocaleString()}`} change="+3.8%" trend="up" icon="📊" color="blue" delay={200} />
        <StatCard title="Customers" value={stats.total_customers.toLocaleString()} change="+9.4%" trend="up" icon="👥" color="purple" delay={300} />
        <StatCard title="Items Sold" value={stats.items_sold.toLocaleString()} change="+15.1%" trend="up" icon="📦" color="teal" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Daily Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily POS Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="transactions" fill="#f59e0b" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
              <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Types */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentTypes}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true} animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {paymentTypes.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Order Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Area type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} fill="url(#hourlyGrad)" dot={{ fill: "#f59e0b", r: 5 }} isAnimationActive={true} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-2">Peak Hour</p>
              <p className="text-4xl font-bold">6:00 PM</p>
            </div>
            <div className="text-5xl opacity-20">⏰</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">40 orders during peak</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-2">Items per Transaction</p>
              <p className="text-4xl font-bold">3.2</p>
            </div>
            <div className="text-5xl opacity-20">🛍️</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+0.5 vs last month</span>
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

function StatCard({ title, value, change, trend, icon, color, delay }) {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-200",
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    teal: "bg-teal-50 border-teal-200",
  };
  const trendColors = {
    amber: "text-amber-600",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    teal: "text-teal-600",
  };

  return (
    <div className={`rounded-2xl p-6 border ${colorClasses[color]} shadow-sm hover:shadow-md transition animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl animate-bounce" style={{ animationDelay: `${delay}ms` }}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>
      <div className="flex items-center gap-2">
        {trend === "up" ? <ArrowUp size={16} className={trendColors[color]} /> : <ArrowDown size={16} className={trendColors[color]} />}
        <span className={`text-sm font-semibold ${trendColors[color]}`}>{change}</span>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>
    </div>
  );
}