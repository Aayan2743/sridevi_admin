import { useMemo } from "react";

export default function StaffComponent() {
  /* ================= MOCK DATA ================= */
  const staffList = [
    {
      id: 1,
      name: "Arun",
      email: "arun@shop.com",
      phone: "9000011111",
      role: "Manager",
      orders: [
        { id: 1, total: 4500 },
        { id: 2, total: 6200 },
      ],
    },
    {
      id: 2,
      name: "Sneha",
      email: "sneha@shop.com",
      phone: "9000022222",
      role: "Sales Executive",
      orders: [{ id: 3, total: 3200 }],
    },
    {
      id: 3,
      name: "Rahul",
      email: "rahul@shop.com",
      phone: "9000033333",
      role: "Delivery",
      orders: [
        { id: 4, total: 12000 },
        { id: 5, total: 5400 },
        { id: 6, total: 2100 },
      ],
    },
  ];

  /* ================= CALCULATIONS ================= */
  const rows = useMemo(() => {
    return staffList.map((s) => {
      const orderCount = s.orders.length;
      const totalSales = s.orders.reduce((sum, o) => sum + o.total, 0);

      return {
        ...s,
        orderCount,
        totalSales,
      };
    });
  }, []);

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Staff Report</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-center">Orders</th>
              <th className="px-4 py-3 text-right">Total Sales</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((s, i) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">{s.role}</td>
                <td className="px-4 py-3 text-center">{s.orderCount}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹ {s.totalSales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
