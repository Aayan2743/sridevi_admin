"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Users,
  UserCheck,
  ShoppingBag,
  Heart,
  LayoutGrid,
  Table,
} from "lucide-react";
import api from "../api/axios";

// import api from "@/services/api";

/* ================= COMPONENT ================= */

export default function UserDashboard() {
  const [view, setView] = useState("table");
  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes] = await Promise.all([
        api .get("/cart/dashboard/stats"),
        api.get("/cart/users"),
      ]);

      const s = statsRes.data.data;

      /* ================= STATS ================= */
      setStats([
        {
          title: "Total Users",
          value: s.total_users,
          icon: <Users />,
          gradient: "from-indigo-500 to-purple-500",
        },
        {
          title: "Active Users",
          value: s.active_users,
          icon: <UserCheck />,
          gradient: "from-green-500 to-emerald-500",
        },
        {
          title: "Total Orders",
          value: s.total_orders,
          icon: <ShoppingBag />,
          gradient: "from-orange-500 to-red-500",
        },
        {
          title: "Wishlist Items",
          value: s.wishlist_items,
          icon: <Heart />,
          gradient: "from-pink-500 to-rose-500",
        },
      ]);

      /* ================= USERS ================= */
      setUsers(
        usersRes.data.data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: String(u.phone),
          orders: u.orders_count,
          wishlist: u.wishlist_count,
          status: u.orders_count > 0 ? "Active" : "Inactive",
          joined: dayjs(u.created_at).format("DD MMM YYYY"), // ✅ FIXED
        })),
      );
    } catch (error) {
      console.error("Dashboard error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Customers
          </h1>
          <p className="text-sm text-gray-500">
            Overview of all registered users
          </p>
        </div>

        <div className="flex gap-2 self-start md:self-auto">
          <ViewToggle
            active={view === "table"}
            onClick={() => setView("table")}
            icon={<Table size={18} />}
          />
          <ViewToggle
            active={view === "card"}
            onClick={() => setView("card")}
            icon={<LayoutGrid size={18} />}
          />
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${s.gradient} shadow-lg`}
          >
            <div className="absolute right-4 top-4 opacity-20">
              <div className="w-16 h-16">{s.icon}</div>
            </div>

            <p className="text-sm opacity-90">{s.title}</p>
            <p className="text-3xl font-bold mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      {view === "table" ? (
        <UserTable users={users} />
      ) : (
        <UserCards users={users} />
      )}
    </div>
  );
}

/* ================= TABLE VIEW ================= */

function UserTable({ users }) {
  return (
    <div className="bg-white/70 backdrop-blur border rounded-2xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 text-gray-600">
          <tr>
            <th className="p-4 text-left">User</th>
            <th className="p-4 text-left">Phone</th>
            <th className="p-4 text-center">Orders</th>
            <th className="p-4 text-center">Wishlist</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50 transition">
              <td className="p-4">
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </td>
              <td className="p-4">{u.phone}</td>
              <td className="p-4 text-center">{u.orders}</td>
              <td className="p-4 text-center">{u.wishlist}</td>
              <td className="p-4">
                <StatusBadge status={u.status} />
              </td>
              <td className="p-4 text-gray-500">{u.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= CARD VIEW ================= */

function UserCards({ users }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((u) => (
        <div
          key={u.id}
          className="bg-white/70 backdrop-blur border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{u.name}</h3>
              <p className="text-xs text-gray-500 truncate">{u.email}</p>
            </div>
            <StatusBadge status={u.status} />
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-xs">
            <CompactInfo label="Phone" value={u.phone} />
            <CompactInfo label="Joined" value={u.joined} />
            <CompactInfo label="Orders" value={u.orders} />
            <CompactInfo label="Wishlist" value={u.wishlist} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= SMALL UI COMPONENTS ================= */

function ViewToggle({ active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition ${
        active
          ? "bg-gray-900 text-white shadow"
          : "bg-white border hover:bg-gray-50"
      }`}
    >
      {icon}
    </button>
  );
}

function CompactInfo({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
