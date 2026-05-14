import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

/* ================= ROW ================= */
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function POSOrderView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ORDER ================= */
  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin-dashboard/orders-details/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error("ORDER VIEW ERROR:", err);
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATIONS ================= */
  const itemsTotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.price),
      0,
    );
  }, [order]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">Status: {order.status}</p>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          Back
        </button>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-semibold mb-2">Customer Details</h3>
        <p className="text-sm">
          <b>Name:</b> {order.user?.name || "Walk-in"}
        </p>
        <p className="text-sm">
          <b>Mobile:</b> {order.user?.phone || "-"}
        </p>
        <p className="text-sm">
          <b>Email:</b> {order.user?.email || "-"}
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">
            Items ({order.items.length})
          </h3>

          <div className="max-h-[520px] overflow-y-auto space-y-3 pr-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border rounded-xl p-3 hover:bg-gray-50"
              >
                {/* IMAGE */}
                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-gray-100">
                  <img
                    src={
                      item.product?.images?.[0]?.image_url || "/no-image.png"
                    }
                    alt={item.product?.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">
                    Qty {item.quantity} × ₹{item.price}
                  </p>
                </div>

                {/* TOTAL */}
                <div className="font-semibold text-sm">
                  ₹ {Number(item.quantity) * Number(item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold mb-4">Bill Summary</h3>

          <div className="space-y-2">
            <Row label="Items Total" value={`₹ ${itemsTotal}`} />
            <Row label="Discount" value={`₹ ${order.discount}`} />
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-indigo-600">
              ₹ {order.total_amount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
