import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cart/online-orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error("ORDER DETAIL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Order #{order.id}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Back
        </button>
      </div>

      {/* ================= ORDER SUMMARY ================= */}
      <div className="grid grid-cols-4 gap-4">
        <Summary label="Customer" value={order.user?.phone} />
        <Summary label="Payment Mode" value={order.payment_method} />
        <Summary label="Payment Status" value={order.payment_status} />
        <Summary label="Order Status" value={order.order_status} />
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Variant</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3 font-medium">
                  {item.product?.name || "-"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {item.variant?.sku || "-"}
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">₹{item.price}</td>
                <td className="px-4 py-3 text-right font-medium">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= TOTAL ================= */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <Row label="Subtotal" value={`₹${order.subtotal}`} />
          <Row label="Discount" value={`₹${order.discount_amount}`} />
          <Row label="Total" value={`₹${order.total_amount}`} bold />
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Summary = ({ label, value }) => (
  <div className="bg-white border rounded-xl p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium mt-1">{value}</p>
  </div>
);

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className={bold ? "font-semibold" : ""}>{value}</span>
  </div>
);
