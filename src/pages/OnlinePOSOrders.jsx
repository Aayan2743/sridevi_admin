import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='%23e5e7eb'%3E%3Crect width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='%239ca3af'%3E📦%3C/text%3E%3C/svg%3E";

const STATUS_OPTIONS = ["confirmed", "packing", "shipping", "delivered"];

export default function OnlinePOSOrders() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= CHECK PAYMENT ================= */
  const [checkingId, setCheckingId] = useState(null);

  const handleCheckPayment = async (saleId) => {
    setCheckingId(saleId);
    try {
      const res = await api.post("/admin-dashboard/pos/check-payment-status", {
        sale_id: saleId,
      });
      if (res.data.success || res.data.data?.status === "complete") {
        alert(`✅ Payment received!\nInvoice: ${res.data.data.invoice_number || "-"}\nAmount: ₹${res.data.data.grand_total || "-"}\nStatus: ${res.data.data.status}`);
        loadOrders(); // refresh list so badge updates
      } else {
        alert(`⏳ Payment not yet received.\n${res.data.message || "Please check again later."}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to check payment status";
      alert("❌ " + msg);
    } finally {
      setCheckingId(null);
    }
  };

  /* ================= LOCAL COURIER ================= */
  const [localOpen, setLocalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [localCourier, setLocalCourier] = useState({
    partner: "",
    awb: "",
    tracking_url: "",
    shipping_amount: "",
  });

  /* ================= FETCH ORDERS ================= */
  const loadOrders = async (p = page) => {
    try {
      setLoading(true);
      const params = { page: p, per_page: perPage };
      if (search) params.search = search;
      const res = await api.get("/admin-dashboard/calling/online-pos-orders", { params });
      const d = res.data.data;
      setOrders(d.data || []);
      setTotalPages(d.last_page || 1);
      setPage(d.current_page || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [perPage]);

  /* ================= SEARCH SUBMIT ================= */
  const handleSearch = () => {
    setPage(1);
    loadOrders(1);
  };

  /* ================= SHIPROCKET ================= */
  const sendToShiprocket = async (orderId) => {
    if (!window.confirm("Send this order to Shiprocket?")) return;

    try {
      const res = await api.post(
        `/admin-dashboard/shiprocket/create/${orderId}`,
      );

      alert(`Shipment created!\nAWB: ${res.data.data?.awb_code || "-"}`);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Shiprocket failed");
    }
  };

  /* ================= LOCAL COURIER SAVE ================= */
  const saveLocalCourier = async () => {
    try {
      await api.post(
        `/admin-dashboard/orders/${selectedOrderId}/local-shipping`,
        localCourier,
      );

      alert("Local courier added");
      setLocalOpen(false);
      setLocalCourier({
        partner: "",
        awb: "",
        tracking_url: "",
        shipping_amount: "",
      });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  /* ================= STATUS BADGE ================= */
  const shipmentBadge = (status) => {
    if (!status)
      return <span className="text-xs text-gray-400">Not shipped</span>;
    const map = {
      pending: "bg-gray-200 text-gray-700",
      created: "bg-blue-100 text-blue-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${map[status] || "bg-gray-100"}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Online POS Orders</h1>

      <div className="flex gap-2">
        <input
          placeholder="Search by invoice / name / phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border px-3 py-2 rounded w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Invoice</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Shipping</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(page - 1) * perPage + i + 1}</td>
                  <td className="p-3 font-medium">{o.invoice_number || `ORD-${o.id}`}</td>
                  <td className="p-3">{o.customer_name || o.customer?.name || o.user?.name || "-"}</td>
                  <td className="p-3">{o.customer_phone || o.customer?.phone || o.user?.phone || "-"}</td>
                  <td className="p-3">
                    <div className="flex -space-x-1.5 items-center" title={(o.items || []).map(it => it.product_name + (it.variant_name ? ` (${it.variant_name})` : '')).join(', ')}>
                      {(o.items || []).slice(0, 4).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.product_image || PLACEHOLDER_IMG}
                          alt={item.product_name || 'Item'}
                          className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        />
                      ))}
                      {(o.items || []).length > 4 && (
                        <span className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-500 shadow-sm">
                          +{o.items.length - 4}
                        </span>
                      )}
                      {(o.items || []).length === 0 && (
                        <span className="text-[11px] text-gray-400 italic">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">₹ {o.grand_total}</td>
                  <td className="p-3">
                    <span className="text-xs capitalize">{o.payment_method || "-"}</span>
                  </td>
                  <td className="p-3 space-y-1">
                    {shipmentBadge(o.shipment_status)}
                    {o.awb_no && (
                      <div className="text-xs text-gray-500">AWB: {o.awb_no}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      o.status === "confirmed" ? "bg-green-100 text-green-700" :
                      o.status === "packing" ? "bg-blue-100 text-blue-700" :
                      o.status === "shipping" ? "bg-indigo-100 text-indigo-700" :
                      o.status === "delivered" ? "bg-gray-100 text-gray-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {o.status || "pending"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 space-y-1">
                    <button
                      onClick={() => handleCheckPayment(o.id)}
                      disabled={checkingId === o.id}
                      className="block w-full bg-green-600 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                    >
                      {checkingId === o.id ? "Checking..." : "Check Payment"}
                    </button>

                    {!o.shiprocket_order_id && (
                      <button
                        onClick={() => sendToShiprocket(o.id)}
                        className="block w-full bg-blue-600 text-white text-xs px-2 py-1 rounded"
                      >
                        Shiprocket
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setLocalCourier({
                          partner: o.shipping_partner || "",
                          awb: o.awb_no || "",
                          tracking_url: o.tracking_number || "",
                          shipping_amount: "",
                        });
                        setLocalOpen(true);
                      }}
                      className="block w-full bg-orange-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Local
                    </button>

                    <button
                      onClick={() => navigate(`/pos/orders/${o.id}`)}
                      className="block text-xs text-indigo-600 text-center"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-gray-400">
                    No online POS orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(+e.target.value);
            setPage(1);
          }}
          className="border px-2 py-1"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => loadOrders(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            {page} / {totalPages || 1}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => loadOrders(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* LOCAL COURIER POPUP */}
      {localOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-lg">Local Courier</h3>

            {["partner", "awb", "tracking_url", "shipping_amount"].map((f) => (
              <input
                key={f}
                placeholder={f.replace("_", " ")}
                value={localCourier[f]}
                onChange={(e) =>
                  setLocalCourier({
                    ...localCourier,
                    [f]: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded"
              />
            ))}

            <div className="flex gap-3">
              <button
                onClick={saveLocalCourier}
                className="flex-1 bg-black text-white py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setLocalOpen(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}