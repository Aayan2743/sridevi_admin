import { Users, UserPlus, UserCheck, ShoppingBag, Heart, Filter, ArrowUp, ArrowDown } from "lucide-react";
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

const DUMMY_CUSTOMER_GROWTH = [
  { month: "Jan", new: 45, total: 1200 },
  { month: "Feb", new: 52, total: 1252 },
  { month: "Mar", new: 38, total: 1290 },
  { month: "Apr", new: 65, total: 1355 },
  { month: "May", new: 48, total: 1403 },
  { month: "Jun", new: 72, total: 1475 },
];

const DUMMY_AGE_GROUPS = [
  { group: "18-24", count: 120 },
  { group: "25-34", count: 280 },
  { group: "35-44", count: 190 },
  { group: "45-54", count: 110 },
  { group: "55+", count: 60 },
];

const DUMMY_LOYALTY = [
  { name: "New", value: 180 },
  { name: "Regular", value: 250 },
  { name: "VIP", value: 80 },
  { name: "Inactive", value: 120 },
];

export default function CustomersDashboard() {
  useDynamicTitle("Customers Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_customers: 0,
    new_customers: 0,
    active_customers: 0,
    total_orders: 0,
    wishlist_items: 0,
  });

  const [growthData, setGrowthData] = useState(DUMMY_CUSTOMER_GROWTH);
  const [ageGroups, setAgeGroups] = useState(DUMMY_AGE_GROUPS);
  const [loyaltyData, setLoyaltyData] = useState(DUMMY_LOYALTY);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/customers-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_customers: data.total_customers || 0,
          new_customers: data.new_customers || 0,
          active_customers: data.active_customers || 0,
          total_orders: data.total_orders || 0,
          wishlist_items: data.wishlist_items || 0,
        });

        setGrowthData(data.growth?.length > 0 ? data.growth : DUMMY_CUSTOMER_GROWTH);
        setAgeGroups(data.age_groups?.length > 0 ? data.age_groups : DUMMY_AGE_GROUPS);
        setLoyaltyData(data.loyalty?.length > 0 ? data.loyalty : DUMMY_LOYALTY);
      } else {
        setError("Failed to load customers dashboard data");
      }
    } catch (error) {
      console.error("Customers dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch customers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.customers")) {
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
        <div className="bg-gradient-to-r from-sky-900 to-blue-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Customers Dashboard 👥</h1>
            <p className="text-sky-200 text-lg">Customer insights and engagement analytics</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">👥</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <button onClick={() => fetchDashboard(startDate, endDate)} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Customers" value={stats.total_customers.toLocaleString()} change="+6.8%" trend="up" icon="👥" color="blue" delay={0} />
        <StatCard title="New (This Month)" value={stats.new_customers.toLocaleString()} change="+12.3%" trend="up" icon="🆕" color="green" delay={100} />
        <StatCard title="Active" value={stats.active_customers.toLocaleString()} change="+4.5%" trend="up" icon="✅" color="teal" delay={200} />
        <StatCard title="Total Orders" value={stats.total_orders.toLocaleString()} change="+9.2%" trend="up" icon="🛒" color="orange" delay={300} />
        <StatCard title="Wishlist Items" value={stats.wishlist_items.toLocaleString()} change="+15.7%" trend="up" icon="❤️" color="rose" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Customer Growth */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="customerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} fill="url(#customerGrad)" dot={{ fill: "#0ea5e9", r: 5 }} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} fill="none" dot={{ fill: "#22c55e", r: 3 }} isAnimationActive={true} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loyalty Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Loyalty</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loyaltyData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true} animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {loyaltyData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Groups */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Age Group Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageGroups}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="group" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-2">Avg. Customer Lifetime Value</p>
              <p className="text-4xl font-bold">₹4,850</p>
            </div>
            <div className="text-5xl opacity-20">💎</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+18% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-2">Repeat Purchase Rate</p>
              <p className="text-4xl font-bold">42%</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+5% vs last month</span>
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
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    teal: "bg-teal-50 border-teal-200",
    orange: "bg-orange-50 border-orange-200",
    rose: "bg-rose-50 border-rose-200",
  };
  const trendColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    teal: "text-teal-600",
    orange: "text-orange-600",
    rose: "text-rose-600",
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