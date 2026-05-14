// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";

// export default function CustomerOrders() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const res = await api.get(`/admin-dashboard/customer/${id}/orders`);

//       if (res.data.success) {
//         setOrders(res.data.data);
//       }
//     } catch {
//       alert("Failed to load orders");
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <button
//         onClick={() => navigate(-1)}
//         className="px-4 py-2 bg-gray-200 rounded"
//       >
//         ← Back
//       </button>

//       <h2 className="text-xl font-bold">Customer Orders</h2>

//       <div className="bg-white shadow rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-3">Invoice</th>
//               <th className="p-3">Total</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Date</th>
//               <th className="p-3">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.id} className="border-t">
//                 <td className="p-3">{order.invoice_number}</td>
//                 <td className="p-3">₹ {order.grand_total}</td>
//                 <td className="p-3">{order.status}</td>
//                 <td className="p-3">
//                   {new Date(order.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="p-3">
//                   <button
//                     onClick={() => navigate(`/calling/order/${order.id}`)}
//                     className="px-3 py-1 bg-gray-200 rounded"
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CustomerOrders() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/admin-dashboard/customer/${id}/orders`);

      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch {
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  /* 🔢 Calculations */
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, o) => sum + parseFloat(o.grand_total),
    0,
  );

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium capitalize";

    if (status === "completed") return `${base} bg-green-100 text-green-600`;

    if (status === "shipped") return `${base} bg-blue-100 text-blue-600`;

    if (status === "created") return `${base} bg-yellow-100 text-yellow-600`;

    if (status === "cancelled") return `${base} bg-red-100 text-red-600`;

    return `${base} bg-gray-100 text-gray-600`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 🔙 Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-semibold">Customer Orders</h2>
      </div>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h3 className="text-2xl font-bold">{totalOrders}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Amount Spent</p>
          <h3 className="text-2xl font-bold text-indigo-600">
            ₹ {totalSpent.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* 📋 Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-gray-400">No orders found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">Invoice</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {order.invoice_number}
                  </td>

                  <td className="px-6 py-4">₹ {order.grand_total}</td>

                  <td className="px-6 py-4">
                    <span className={statusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/calling/order/${order.id}`)}
                      className="bg-gray-200 px-3 py-1 rounded-md text-sm hover:bg-gray-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
