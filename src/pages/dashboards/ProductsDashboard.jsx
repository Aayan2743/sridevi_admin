import { Package, Tag, Star, AlertTriangle, Filter, ArrowUp, ArrowDown } from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../components/AccessDenied";

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const DUMMY_CATEGORY_DATA = [
  { category: "Herbal", count: 120 },
  { category: "Ayurvedic", count: 85 },
  { category: "Supplements", count: 65 },
  { category: "Oils", count: 45 },
  { category: "Skincare", count: 55 },
  { category: "Others", count: 30 },
];

const DUMMY_STOCK_STATUS = [
  { name: "In Stock", value: 280 },
  { name: "Low Stock", value: 45 },
  { name: "Out of Stock", value: 20 },
  { name: "Discontinued", value: 15 },
];

const DUMMY_TOP_PRODUCTS = [
  { name: "Product A", sales: 450 },
  { name: "Product B", sales: 380 },
  { name: "Product C", sales: 320 },
  { name: "Product D", sales: 290 },
  { name: "Product E", sales: 250 },
];

export default function ProductsDashboard() {
  useDynamicTitle("Products Dashboard");

  const { can } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_products: 0,
    active_products: 0,
    low_stock: 0,
    out_of_stock: 0,
    categories: 0,
  });

  const [categoryData, setCategoryData] = useState(DUMMY_CATEGORY_DATA);
  const [stockStatus, setStockStatus] = useState(DUMMY_STOCK_STATUS);
  const [topProducts, setTopProducts] = useState(DUMMY_TOP_PRODUCTS);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/products-stats");

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_products: data.total_products || 0,
          active_products: data.active_products || 0,
          low_stock: data.low_stock || 0,
          out_of_stock: data.out_of_stock || 0,
          categories: data.categories || 0,
        });

        setCategoryData(data.category_distribution?.length > 0 ? data.category_distribution : DUMMY_CATEGORY_DATA);
        setStockStatus(data.stock_status?.length > 0 ? data.stock_status : DUMMY_STOCK_STATUS);
        setTopProducts(data.top_products?.length > 0 ? data.top_products : DUMMY_TOP_PRODUCTS);
      } else {
        setError("Failed to load products dashboard data");
      }
    } catch (error) {
      console.error("Products dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch products data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.products")) {
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
        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Products Dashboard 📦</h1>
            <p className="text-emerald-200 text-lg">Inventory and product performance analytics</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">📦</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Products" value={stats.total_products.toLocaleString()} change="+5.2%" trend="up" icon="📦" color="emerald" delay={0} />
        <StatCard title="Active" value={stats.active_products.toLocaleString()} change="+3.8%" trend="up" icon="✅" color="green" delay={100} />
        <StatCard title="Low Stock" value={stats.low_stock.toLocaleString()} change="+12%" trend="up" icon="⚠️" color="yellow" delay={200} />
        <StatCard title="Out of Stock" value={stats.out_of_stock.toLocaleString()} change="-8.5%" trend="down" icon="❌" color="red" delay={300} />
        <StatCard title="Categories" value={stats.categories.toLocaleString()} change="+2" trend="up" icon="🏷️" color="teal" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="category" type="category" stroke="#9ca3af" width={100} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} isAnimationActive={true} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Status</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={stockStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stockStatus.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="sales" fill="#f59e0b" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Avg. Product Rating</p>
              <p className="text-4xl font-bold">4.2 ⭐</p>
            </div>
            <div className="text-5xl opacity-20">⭐</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowUp size={24} />
            </div>
            <span className="text-sm">+0.3 vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-2">Total Variants</p>
              <p className="text-4xl font-bold">1,245</p>
            </div>
            <div className="text-5xl opacity-20">🔄</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowUp size={24} />
            </div>
            <span className="text-sm">+8.2% vs last month</span>
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
    emerald: "bg-emerald-50 border-emerald-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200",
    teal: "bg-teal-50 border-teal-200",
  };

  const trendColors = {
    emerald: "text-emerald-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
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