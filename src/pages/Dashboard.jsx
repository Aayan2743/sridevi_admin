import { Users, Package, ShoppingCart, TrendingUp, Filter, ArrowUp, ArrowDown } from "lucide-react";
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
} from "recharts";
import { useState, useEffect } from "react";
import useDynamicTitle from "../hooks/useDynamicTitle";
import api from "../api/axios";


import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

// Dummy data for charts
const DUMMY_REVENUE_DATA = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
  { month: "Jul", revenue: 3490 },
  { month: "Aug", revenue: 4200 },
  { month: "Sep", revenue: 3800 },
  { month: "Oct", revenue: 4100 },
  { month: "Nov", revenue: 4500 },
  { month: "Dec", revenue: 5000 },
];

const DUMMY_ORDER_DATA = [
  { day: "Mon", orders: 24 },
  { day: "Tue", orders: 13 },
  { day: "Wed", orders: 98 },
  { day: "Thu", orders: 39 },
  { day: "Fri", orders: 48 },
  { day: "Sat", orders: 38 },
  { day: "Sun", orders: 43 },
];

export default function Dashboard() {
  useDynamicTitle("Dashboard");

  const { can,permissions } = useAuth();

  console.log("User permissions:", permissions); // 🔥 DEBUG: log permissions
  console.log("User can view dashboard:", can("dashboard.view")); // 🔥 DEBUG: log permission check


const [permLoading, setPermLoading] = useState(true);
  // const [permissions, setPermissions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [revenueData, setRevenueData] = useState(DUMMY_REVENUE_DATA);
  const [orderData, setOrderData] = useState(DUMMY_ORDER_DATA);

  /* ================= FETCH API ================= */
  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/stats", {
        params: {
          start_date: start,
          end_date: end,
        },
      });

      if (res.data?.status) {
        const data = res.data.data;

        // Top Stats
        setStats({
          customers: data.customers,
          products: data.products,
          orders: data.orders,
          revenue: parseFloat(data.revenue),
        });

        // Revenue Chart (convert revenue to number)
        const formattedRevenue = data.revenue_chart && data.revenue_chart.length > 0
          ? data.revenue_chart.map((item) => ({
              month: item.month,
              revenue: parseFloat(item.revenue),
            }))
          : DUMMY_REVENUE_DATA;

        setRevenueData(formattedRevenue);

        // Orders Chart
        const formattedOrders = data.orders_chart && data.orders_chart.length > 0
          ? data.orders_chart
          : DUMMY_ORDER_DATA;

        setOrderData(formattedOrders);
      } else {
        setError("Failed to load dashboard data");
        setRevenueData(DUMMY_REVENUE_DATA);
        setOrderData(DUMMY_ORDER_DATA);
      }
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch dashboard data");
      // Use dummy data on error
      setRevenueData(DUMMY_REVENUE_DATA);
      setOrderData(DUMMY_ORDER_DATA);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchDashboard();
    // fetchPermissions();
  }, []);

  if (!can("dashboard.view")) {
  return (
    <AccessDenied />
  );
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

      {/* Header with Welcome Banner */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back 👋</h1>
            <p className="text-slate-300 text-lg">Here's what's happening with your business today</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">📊</div>
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

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total active users"
          value={stats.customers.toLocaleString()}
          change="+2.6%"
          trend="up"
          icon="👥"
          color="blue"
          delay={0}
        />
        <StatCard
          title="Total installed"
          value={stats.products.toLocaleString()}
          change="-0.2%"
          trend="down"
          icon="📦"
          color="cyan"
          delay={100}
        />
        <StatCard
          title="Total downloads"
          value={stats.orders.toLocaleString()}
          change="-0.1%"
          trend="down"
          icon="⬇️"
          color="orange"
          delay={200}
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          change="+5.2%"
          trend="up"
          icon="💰"
          color="green"
          delay={300}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart - Larger */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>2023</option>
              <option>2024</option>
              <option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData.slice(0, 3)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="revenue"
                isAnimationActive={true}
                animationDuration={800}
              >
                <Cell fill="#0ea5e9" />
                <Cell fill="#06b6d4" />
                <Cell fill="#14b8a6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            />
            <Bar 
              dataKey="orders" 
              fill="#8b5cf6" 
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-2">Conversions</p>
              <p className="text-4xl font-bold animate-count-up">38,566</p>
            </div>
            <div className="text-5xl opacity-20">📈</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">48%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Applications</p>
              <p className="text-4xl font-bold animate-count-up">55,566</p>
            </div>
            <div className="text-5xl opacity-20">📱</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">29%</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-count-up {
          animation: countUp 1s ease-out;
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
  };

  const trendColors = {
    blue: "text-blue-600",
    cyan: "text-cyan-600",
    orange: "text-orange-600",
    green: "text-green-600",
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
          <ArrowUp size={16} className={`${trendColors[color]}`} />
        ) : (
          <ArrowDown size={16} className={`${trendColors[color]}`} />
        )}
        <span className={`text-sm font-semibold ${trendColors[color]}`}>{change}</span>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>
    </div>
  );
}
