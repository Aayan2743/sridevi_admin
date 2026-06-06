import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
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
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingHistory, setShippingHistory] = useState([]);
  const [shippingHistoryLoading, setShippingHistoryLoading] = useState(false);
  const [shippingBtnLoading, setShippingBtnLoading] = useState(false);

  /* ================= PARSE ITEMS (snapshot JSON string → array) ================= */
  const parsedItems = useMemo(() => {
    if (!order) return [];

    // If items is a JSON string, parse it
    if (typeof order.items === "string") {
      try {
        return JSON.parse(order.items);
      } catch {
        return [];
      }
    }

    // If items is already an array, return as-is
    if (Array.isArray(order.items)) {
      return order.items;
    }

    return [];
  }, [order]);

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
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SHIPPING HISTORY ================= */
  const fetchShippingHistory = async () => {
    try {
      setShowShippingModal(true);
      setShippingBtnLoading(true);
      setShippingHistoryLoading(true);

      const res = await api.get(`/admin-dashboard/orders/${id}/shipping-all`);

      const records = res.data.data?.data ?? [];

      setShippingHistory(records);

      if (records.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Records",
          text: "No shipping records found for this order.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("SHIPPING HISTORY ERROR:", err);
      setShippingHistory([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to load shipping history.",
      });
    } finally {
      setShippingHistoryLoading(false);
      setShippingBtnLoading(false);
    }
  };

  /* ================= CALCULATIONS ================= */
  const itemsTotal = useMemo(() => {
    return parsedItems.reduce(
      (sum, i) => sum + Number(i.qty ?? i.quantity ?? 1) * Number(i.price ?? 0),
      0,
    );
  }, [parsedItems]);

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

        <div className="flex gap-2">
          <button
            onClick={fetchShippingHistory}
            disabled={shippingBtnLoading}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {shippingBtnLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {shippingBtnLoading ? "Loading..." : "All Shipping Details"}
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Back
          </button>
        </div>
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

      {/* ================= TRACKING ================= */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-semibold mb-3">Tracking Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p>
            <b>Shipping Provider:</b> {order.tracking?.shipping_provider || "-"}
          </p>

          <p>
            <b>Courier Partner:</b> {order.tracking?.partner || "-"}
          </p>

          <p>
            <b>AWB:</b> {order.tracking?.awb || "-"}
          </p>

          <p>
            <b>Status:</b> {order.tracking?.shipment_status || "-"}
          </p>

          <p>
            <b>Shipping Charge:</b> ₹{order.tracking?.shipping_amount || 0}
          </p>

          <p className="md:col-span-2">
            <b>Tracking URL:</b>{" "}
            {order.tracking?.tracking_url ? (
              <a
                href={order.tracking.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Track Shipment
              </a>
            ) : (
              "-"
            )}
          </p>
        </div>
      </div>
      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">
            Items ({parsedItems.length})
          </h3>

          <div className="max-h-[520px] overflow-y-auto space-y-3 pr-2">
            {parsedItems.map((item, idx) => {
              const qty = Number(item.qty ?? item.quantity ?? 1);
              const price = Number(item.price ?? 0);
              const mrp = Number(item.MRP ?? item.mrp ?? 0);
              const discount = Number(item.discount ?? 0);
              const lineTotal = price * qty;

              return (
                <div
                  key={item.id ?? idx}
                  className="flex items-center gap-4 border rounded-xl p-3 hover:bg-gray-50"
                >
                  <div className="h-16 w-16 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                    <img
                      src={
                        item.product?.images?.find((i) => i.is_primary)
                          ?.image_url ||
                        item.product?.images?.[0]?.image_url ||
                        "/no-image.png"
                      }
                      alt={item.product_name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product_name || `Product #${item.product_id}`}
                    </p>
                    {item.variation_name && (
                      <p className="text-xs text-gray-400 truncate">
                        {item.variation_name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                      <span>Qty: {qty}</span>
                      <span>Rate: ₹{price.toFixed(2)}</span>
                      {mrp > 0 && <span>MRP: ₹{mrp.toFixed(2)}</span>}
                      {discount > 0 && (
                        <span className="text-rose-600">
                          Disc: ₹{discount.toFixed(2)}
                        </span>
                      )}
                      {item.tax?.gst_enabled && item.tax?.gst_type === "exclusive" && (
                        <span className="text-emerald-600">
                          GST: {item.tax.gst_percent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="font-semibold text-sm whitespace-nowrap">
                    ₹{lineTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="font-semibold mb-2">Bill Summary</h3>

          <Row
            label="Subtotal"
            value={`₹ ${Number(order.sub_total || order.subtotal || 0).toFixed(2)}`}
          />

          {Number(order.product_discount ?? 0) > 0 && (
            <Row
              label="Product Discount"
              value={`- ₹ ${Number(order.product_discount).toFixed(2)}`}
            />
          )}

          {Number(order.billed_discount ?? 0) > 0 && (
            <Row
              label="Bill Discount"
              value={`- ₹ ${Number(order.billed_discount).toFixed(2)}`}
            />
          )}

          <Row
            label="Tax (GST)"
            value={`₹ ${Number(order.tax_total || 0).toFixed(2)}`}
          />

          <Row
            label="Delivery Charge"
            value={`₹ ${Number(order.delivery_charge || order.delivery_fee || 0).toFixed(2)}`}
          />

          <div className="border-t pt-3 mt-3 flex justify-between items-center">
            <span className="text-base font-semibold">Grand Total</span>
            <span className="text-xl font-bold text-indigo-600">
              ₹ {Number(order.grand_total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= SHIPPING DETAILS MODAL ================= */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-lg font-semibold">All Shipping Details</h2>
              <button
                onClick={() => setShowShippingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold text-base mb-2">Shipping Address</h4>
                <p>{order.address?.address_line1 || "-"}</p>
                {order.address?.address_line2 && <p>{order.address.address_line2}</p>}
                <p>
                  {[order.address?.city, order.address?.state, order.address?.pincode]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>

              <hr />

              {/* Loading State */}
              {shippingHistoryLoading && (
                <div className="text-center py-6 text-gray-500">
                  Loading shipping history...
                </div>
              )}

              {/* No Records */}
              {!shippingHistoryLoading && shippingHistory.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No shipping records found.
                </div>
              )}

              {/* Shipping Records */}
              {!shippingHistoryLoading &&
                shippingHistory.map((record, idx) => (
                  <div
                    key={record.id ?? idx}
                    className="border rounded-lg p-4 space-y-2 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Shipment #{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          record.shipment_status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : record.shipment_status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : record.shipment_status === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {record.shipment_status || "-"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div>
                        <span className="text-gray-500">Shipping Provider</span>
                        <p className="font-medium">{record.shipping_provider || "-"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Courier Partner</span>
                        <p className="font-medium">{record.partner || "-"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">AWB Number</span>
                        <p className="font-medium">{record.awb || "-"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Shipping Charge</span>
                        <p className="font-medium">₹{record.shipping_amount || 0}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Date</span>
                        <p className="font-medium">
                          {record.created_at
                            ? new Date(record.created_at).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {record.tracking_url && (
                      <div className="pt-1">
                        <a
                          href={record.tracking_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline text-xs break-all"
                        >
                          {record.tracking_url}
                        </a>
                      </div>
                    )}
                  </div>
                ))}

              {/* Order-level notes / extra fields */}
              {order.shipping_note && (
                <>
                  <hr />
                  <div>
                    <h4 className="font-semibold text-base mb-1">Shipping Note</h4>
                    <p className="text-gray-700">{order.shipping_note}</p>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-5 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
