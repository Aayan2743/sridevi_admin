import { TrendingUp, DollarSign, CreditCard, Wallet, TrendingDown, Filter, ArrowUp, ArrowDown } from "lucide-react";
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

const DUMMY_MONTHLY_REVENUE = [
  { month: "Jan", revenue: 450000, profit: 120000 },
  { month: "Feb", revenue: 520000, profit: 145000 },
  { month: "Mar", revenue: 480000, profit: 130000 },
  { month: "Apr", revenue: 610000, profit: 175000 },
  { month: "May", revenue: 580000, profit: 160000 },
  { month: "Jun", revenue: 720000, profit: 210000 },
];

const DUMMY_REVENUE_SOURCES = [
  { source: "Online Store", value: 420000 },
  { source: "POS", value: 280000 },
  { source: "Wholesale", value: 150000 },
  { source: "Others", value: 50000 },
];

const DUMMY_EXPENSES = [
  { category: "Inventory", amount: 180000 },
  { category: "Salaries", amount: 120000 },
  { category: "Marketing", amount: 45000 },
  { category: "Shipping", amount: 25000 },
  { category: "Utilities", amount: 15000 },
];

export default function RevenueDashboard() {
  useDynamicTitle("Revenue Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_revenue: 0,
    total_profit: 0,
    total_expenses: 0,
    avg_daily: 0,
    growth_rate: 0,
  });

  const [monthlyData, setMonthlyData] = useState(DUMMY_MONTHLY_REVENUE);
  const [sourceData, setSourceData] = useState(DUMMY_REVENUE_SOURCES);
  const [expenseData, setExpenseData] = useState(DUMMY_EXPENSES);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/revenue-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_revenue: parseFloat(data.total_revenue) || 0,
          total_profit: parseFloat(data.total_profit) || 0,
          total_expenses: parseFloat(data.total_expenses) || 0,
          avg_daily: parseFloat(data.avg_daily) || 0,
          growth_rate: parseFloat(data.growth_rate) || 0,
        });

        setMonthlyData(data.monthly?.length > 0 ? data.monthly : DUMMY_MONTHLY_REVENUE);
        setSourceData(data.sources?.length > 0 ? data.sources : DUMMY_REVENUE_SOURCES);
        setExpenseData(data.expenses?.length > 0 ? data.expenses : DUMMY_EXPENSES);
      } else {
        setError("Failed to load revenue dashboard data");
      }
    } catch (error) {
      console.error("Revenue dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.revenue")) {
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
        <div className="bg-gradient-to-r from-green-900 to-emerald-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Revenue Dashboard 💰</h1>
            <p className="text-green-200 text-lg">Financial performance and revenue analytics</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">💰</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
          </div>
          <button onClick={() => fetchDashboard(startDate, endDate)} disabled={loading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Revenue" value={`₹${stats.total_revenue.toLocaleString()}`} change="+15.3%" trend="up" icon="💰" color="green" delay={0} />
        <StatCard title="Net Profit" value={`₹${stats.total_profit.toLocaleString()}`} change="+18.7%" trend="up" icon="📈" color="emerald" delay={100} />
        <StatCard title="Expenses" value={`₹${stats.total_expenses.toLocaleString()}`} change="+5.2%" trend="up" icon="💸" color="red" delay={200} />
        <StatCard title="Avg. Daily" value={`₹${stats.avg_daily.toLocaleString()}`} change="+12.4%" trend="up" icon="📊" color="blue" delay={300} />
        <StatCard title="Growth Rate" value={`${stats.growth_rate}%`} change="+2.1%" trend="up" icon="🚀" color="purple" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fill="url(#revGrad)" dot={{ fill: "#22c55e", r: 5 }} isAnimationActive={true} animationDuration={800} />
              <Area type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} fill="none" dot={{ fill: "#f59e0b", r: 3 }} isAnimationActive={true} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Sources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true} animationDuration={800}
                label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
              >
                {sourceData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-2">Profit Margin</p>
              <p className="text-4xl font-bold">28.5%</p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+3.2% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sky-100 text-sm font-medium mb-2">Monthly Recurring Revenue</p>
              <p className="text-4xl font-bold">₹2,85,000</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+8.5% vs last month</span>
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
    green: "bg-green-50 border-green-200",
    emerald: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
  };
  const trendColors = {
    green: "text-green-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
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