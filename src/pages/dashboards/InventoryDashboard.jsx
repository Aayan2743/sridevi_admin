import { Package, AlertTriangle, RefreshCw, Warehouse, TrendingUp, Filter, ArrowUp, ArrowDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../components/AccessDenied";

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const DUMMY_INVENTORY_LEVELS = [
  { category: "Herbal", in_stock: 850, low_stock: 45, out_of_stock: 10 },
  { category: "Ayurvedic", in_stock: 620, low_stock: 30, out_of_stock: 8 },
  { category: "Supplements", in_stock: 450, low_stock: 25, out_of_stock: 5 },
  { category: "Oils", in_stock: 320, low_stock: 15, out_of_stock: 3 },
  { category: "Skincare", in_stock: 380, low_stock: 20, out_of_stock: 6 },
];

const DUMMY_MOVEMENT = [
  { month: "Jan", added: 120, sold: 95 },
  { month: "Feb", added: 145, sold: 110 },
  { month: "Mar", added: 130, sold: 105 },
  { month: "Apr", added: 160, sold: 135 },
  { month: "May", added: 150, sold: 120 },
  { month: "Jun", added: 175, sold: 150 },
];

const DUMMY_SUPPLIER_DATA = [
  { name: "Supplier A", orders: 45, on_time: 40 },
  { name: "Supplier B", orders: 32, on_time: 28 },
  { name: "Supplier C", orders: 28, on_time: 22 },
  { name: "Supplier D", orders: 18, on_time: 16 },
];

export default function InventoryDashboard() {
  useDynamicTitle("Inventory Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_items: 0,
    in_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    pending_orders: 0,
  });

  const [levelData, setLevelData] = useState(DUMMY_INVENTORY_LEVELS);
  const [movementData, setMovementData] = useState(DUMMY_MOVEMENT);
  const [supplierData, setSupplierData] = useState(DUMMY_SUPPLIER_DATA);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/inventory-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_items: data.total_items || 0,
          in_stock: data.in_stock || 0,
          low_stock: data.low_stock || 0,
          out_of_stock: data.out_of_stock || 0,
          pending_orders: data.pending_orders || 0,
        });

        setLevelData(data.levels?.length > 0 ? data.levels : DUMMY_INVENTORY_LEVELS);
        setMovementData(data.movement?.length > 0 ? data.movement : DUMMY_MOVEMENT);
        setSupplierData(data.suppliers?.length > 0 ? data.suppliers : DUMMY_SUPPLIER_DATA);
      } else {
        setError("Failed to load inventory dashboard data");
      }
    } catch (error) {
      console.error("Inventory dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.inventory")) {
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
        <div className="bg-gradient-to-r from-yellow-900 to-amber-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Inventory Dashboard 📦</h1>
            <p className="text-yellow-200 text-lg">Stock management and inventory analytics</p>
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
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          </div>
          <button onClick={() => fetchDashboard(startDate, endDate)} disabled={loading} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Items" value={stats.total_items.toLocaleString()} change="+4.2%" trend="up" icon="📦" color="amber" delay={0} />
        <StatCard title="In Stock" value={stats.in_stock.toLocaleString()} change="+3.1%" trend="up" icon="✅" color="green" delay={100} />
        <StatCard title="Low Stock" value={stats.low_stock.toLocaleString()} change="+8.5%" trend="up" icon="⚠️" color="yellow" delay={200} />
        <StatCard title="Out of Stock" value={stats.out_of_stock.toLocaleString()} change="-12.3%" trend="down" icon="❌" color="red" delay={300} />
        <StatCard title="Pending Orders" value={stats.pending_orders.toLocaleString()} change="-6.7%" trend="down" icon="📋" color="blue" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Inventory Levels */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="in_stock" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
              <Bar dataKey="low_stock" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
              <Bar dataKey="out_of_stock" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "In Stock", value: stats.in_stock },
                  { name: "Low Stock", value: stats.low_stock },
                  { name: "Out of Stock", value: stats.out_of_stock },
                ]}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true} animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Movement */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Movement (Added vs Sold)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={movementData}>
            <defs>
              <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Area type="monotone" dataKey="added" stroke="#22c55e" strokeWidth={3} fill="url(#addedGrad)" dot={{ fill: "#22c55e", r: 5 }} isAnimationActive={true} animationDuration={800} />
            <Area type="monotone" dataKey="sold" stroke="#f59e0b" strokeWidth={3} fill="url(#soldGrad)" dot={{ fill: "#f59e0b", r: 5 }} isAnimationActive={true} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Supplier Performance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Supplier Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={supplierData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
            <Bar dataKey="on_time" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-100 text-sm font-medium mb-2">Stock Turnover Rate</p>
              <p className="text-4xl font-bold">4.8x</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+0.6x vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-2">Avg. Restock Time</p>
              <p className="text-4xl font-bold">5.2 days</p>
            </div>
            <div className="text-5xl opacity-20">⏱️</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowDown size={24} /></div>
            <span className="text-sm">-1.3 days vs last month</span>
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
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
  };
  const trendColors = {
    amber: "text-amber-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    blue: "text-blue-600",
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