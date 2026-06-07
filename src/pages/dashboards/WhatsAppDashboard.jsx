import { MessageSquare, Send, Users, CheckCircle, XCircle, Filter, ArrowUp, ArrowDown } from "lucide-react";
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

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#25D366"];

const DUMMY_MESSAGE_TREND = [
  { month: "Jan", sent: 1250, delivered: 1180, read: 950 },
  { month: "Feb", sent: 1420, delivered: 1350, read: 1100 },
  { month: "Mar", sent: 1380, delivered: 1300, read: 1050 },
  { month: "Apr", sent: 1650, delivered: 1580, read: 1320 },
  { month: "May", sent: 1580, delivered: 1500, read: 1250 },
  { month: "Jun", sent: 1850, delivered: 1780, read: 1500 },
];

const DUMMY_MESSAGE_TYPES = [
  { type: "Order Confirmation", count: 450 },
  { type: "Shipping Updates", count: 320 },
  { type: "Promotional", count: 280 },
  { type: "Support", count: 180 },
  { type: "Payment Reminders", count: 150 },
];

const DUMMY_RESPONSE_TIME = [
  { day: "Mon", minutes: 4.5 },
  { day: "Tue", minutes: 3.8 },
  { day: "Wed", minutes: 5.2 },
  { day: "Thu", minutes: 4.1 },
  { day: "Fri", minutes: 6.3 },
  { day: "Sat", minutes: 8.5 },
  { day: "Sun", minutes: 7.2 },
];

export default function WhatsAppDashboard() {
  useDynamicTitle("WhatsApp Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_messages: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    active_chats: 0,
  });

  const [trendData, setTrendData] = useState(DUMMY_MESSAGE_TREND);
  const [typeData, setTypeData] = useState(DUMMY_MESSAGE_TYPES);
  const [responseData, setResponseData] = useState(DUMMY_RESPONSE_TIME);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/whatsapp-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_messages: data.total_messages || 0,
          delivered: data.delivered || 0,
          read: data.read || 0,
          failed: data.failed || 0,
          active_chats: data.active_chats || 0,
        });

        setTrendData(data.trend?.length > 0 ? data.trend : DUMMY_MESSAGE_TREND);
        setTypeData(data.types?.length > 0 ? data.types : DUMMY_MESSAGE_TYPES);
        setResponseData(data.response_time?.length > 0 ? data.response_time : DUMMY_RESPONSE_TIME);
      } else {
        setError("Failed to load WhatsApp dashboard data");
      }
    } catch (error) {
      console.error("WhatsApp dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch WhatsApp data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.whatsapp")) {
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
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">WhatsApp Dashboard 💬</h1>
            <p className="text-green-200 text-lg">Messaging analytics and communication insights</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">💬</div>
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
        <StatCard title="Total Messages" value={stats.total_messages.toLocaleString()} change="+12.5%" trend="up" icon="💬" color="green" delay={0} />
        <StatCard title="Delivered" value={stats.delivered.toLocaleString()} change="+11.8%" trend="up" icon="✅" color="emerald" delay={100} />
        <StatCard title="Read" value={stats.read.toLocaleString()} change="+9.2%" trend="up" icon="👁️" color="blue" delay={200} />
        <StatCard title="Failed" value={stats.failed.toLocaleString()} change="-5.3%" trend="down" icon="❌" color="red" delay={300} />
        <StatCard title="Active Chats" value={stats.active_chats.toLocaleString()} change="+8.7%" trend="up" icon="💬" color="teal" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Message Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="sent" stroke="#25D366" strokeWidth={3} dot={{ fill: "#25D366", r: 5 }} isAnimationActive={true} animationDuration={800} />
              <Line type="monotone" dataKey="delivered" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 4 }} isAnimationActive={true} animationDuration={800} />
              <Line type="monotone" dataKey="read" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} isAnimationActive={true} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Message Types */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Message Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                isAnimationActive={true} animationDuration={800}
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
              >
                {typeData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Avg. Response Time (minutes)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={responseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="minutes" fill="#25D366" radius={[8, 8, 0, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Delivery Rate</p>
              <p className="text-4xl font-bold">95.8%</p>
            </div>
            <div className="text-5xl opacity-20">📨</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+1.2% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#25D366] to-[#20BD5F] rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-2">Read Rate</p>
              <p className="text-4xl font-bold">82.3%</p>
            </div>
            <div className="text-5xl opacity-20">👁️</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+4.7% vs last month</span>
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
    blue: "bg-blue-50 border-blue-200",
    red: "bg-red-50 border-red-200",
    teal: "bg-teal-50 border-teal-200",
  };
  const trendColors = {
    green: "text-green-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
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