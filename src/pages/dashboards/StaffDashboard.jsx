import { Users, Clock, UserCheck, Calendar, TrendingUp, Filter, ArrowUp, ArrowDown } from "lucide-react";
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

const COLORS = ["#0ea5e9", "#06b6d4", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

const DUMMY_ATTENDANCE = [
  { month: "Jan", present: 22, absent: 2, leave: 4 },
  { month: "Feb", present: 20, absent: 3, leave: 5 },
  { month: "Mar", present: 23, absent: 1, leave: 3 },
  { month: "Apr", present: 21, absent: 2, leave: 4 },
  { month: "May", present: 22, absent: 2, leave: 3 },
  { month: "Jun", present: 20, absent: 4, leave: 4 },
];

const DUMMY_DEPARTMENT = [
  { dept: "Sales", count: 12 },
  { dept: "Support", count: 8 },
  { dept: "Warehouse", count: 15 },
  { dept: "Admin", count: 6 },
  { dept: "Delivery", count: 10 },
];

const DUMMY_PERFORMANCE = [
  { name: "Excellent", value: 18 },
  { name: "Good", value: 25 },
  { name: "Average", value: 8 },
  { name: "Below Avg", value: 4 },
];

export default function StaffDashboard() {
  useDynamicTitle("Staff Dashboard");

  const { can } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    total_staff: 0,
    present_today: 0,
    on_leave: 0,
    late_arrivals: 0,
    departments: 0,
  });

  const [attendanceData, setAttendanceData] = useState(DUMMY_ATTENDANCE);
  const [deptData, setDeptData] = useState(DUMMY_DEPARTMENT);
  const [perfData, setPerfData] = useState(DUMMY_PERFORMANCE);

  const fetchDashboard = async (start = "", end = "") => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/admin-dashboard/staff-stats", {
        params: { start_date: start, end_date: end },
      });

      if (res.data?.status) {
        const data = res.data.data;

        setStats({
          total_staff: data.total_staff || 0,
          present_today: data.present_today || 0,
          on_leave: data.on_leave || 0,
          late_arrivals: data.late_arrivals || 0,
          departments: data.departments || 0,
        });

        setAttendanceData(data.attendance?.length > 0 ? data.attendance : DUMMY_ATTENDANCE);
        setDeptData(data.departments_data?.length > 0 ? data.departments_data : DUMMY_DEPARTMENT);
        setPerfData(data.performance?.length > 0 ? data.performance : DUMMY_PERFORMANCE);
      } else {
        setError("Failed to load staff dashboard data");
      }
    } catch (error) {
      console.error("Staff dashboard fetch failed:", error);
      setError(error.response?.data?.message || "Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!can("dashboard.staff")) {
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
        <div className="bg-gradient-to-r from-cyan-900 to-teal-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Staff Dashboard 👨‍💼</h1>
            <p className="text-cyan-200 text-lg">Employee management and attendance analytics</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl">👨‍💼</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
          </div>
          <button onClick={() => fetchDashboard(startDate, endDate)} disabled={loading} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            <Filter size={16} />
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Staff" value={stats.total_staff.toLocaleString()} change="+3" trend="up" icon="👥" color="cyan" delay={0} />
        <StatCard title="Present Today" value={stats.present_today.toLocaleString()} change="+5.2%" trend="up" icon="✅" color="green" delay={100} />
        <StatCard title="On Leave" value={stats.on_leave.toLocaleString()} change="-1" trend="down" icon="🏖️" color="yellow" delay={200} />
        <StatCard title="Late Arrivals" value={stats.late_arrivals.toLocaleString()} change="-8.3%" trend="down" icon="⏰" color="red" delay={300} />
        <StatCard title="Departments" value={stats.departments.toLocaleString()} change="0" trend="up" icon="🏢" color="purple" delay={400} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Attendance Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="present" fill="#14b8a6" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
              <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Rating</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={perfData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true} animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {perfData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={deptData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="dept" type="category" stroke="#9ca3af" width={100} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#14b8a6" radius={[0, 8, 8, 0]} isAnimationActive={true} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Attendance Rate</p>
              <p className="text-4xl font-bold">94.2%</p>
            </div>
            <div className="text-5xl opacity-20">📊</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+2.1% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-2">Avg. Working Hours/Day</p>
              <p className="text-4xl font-bold">8.4 hrs</p>
            </div>
            <div className="text-5xl opacity-20">⏳</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowUp size={24} /></div>
            <span className="text-sm">+0.3 hrs vs last month</span>
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
    cyan: "bg-cyan-50 border-cyan-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200",
    purple: "bg-purple-50 border-purple-200",
  };
  const trendColors = {
    cyan: "text-cyan-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
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