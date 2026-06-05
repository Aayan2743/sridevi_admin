import { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";

export default function CartPanel({ cart = [], setCart }) {
  const { can } = useAuth();
  /* (can unused now, kept for future extensibility) */
  void can;

  /* ================= CUSTOMER ================= */
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [givenAmount, setGivenAmount] = useState("");
  const [balance, setBalance] = useState(0);

  const [showAddCustomerPopup, setShowAddCustomerPopup] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerGender, setNewCustomerGender] = useState("");

  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("cash");

  /* ================= MERCHANT UPI ID (for QR Code) ================= */
  const merchantUpiId = "srideviherbals@upi"; // Configure your merchant UPI ID here

  /* ================= QR CODE PAYMENT ================= */
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrPaymentConfirmed, setQrPaymentConfirmed] = useState(false);

  const calculateBalance = (amount) => {
    const given = Number(amount) || 0;
    const bal = given - total;
    setBalance(bal);
  };

  /* ================= HELPERS ================= */
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  /* ================= CALCULATIONS ================= */
  const subtotal = useMemo(
    () =>
      cart.reduce((s, i) => {
        const price = Number(i.price) || 0;
        const qty = Number(i.qty) || 0;
        return s + price * qty;
      }, 0),
    [cart],
  );

  const gst = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 0;
      const gstPercent = Number(item.tax?.gst_percent) || 0;

      if (item.tax?.gst_enabled && item.tax?.gst_type === "exclusive") {
        return total + (price * qty * gstPercent) / 100;
      }
      return total;
    }, 0);
  }, [cart]);

  const total = Math.max(subtotal + gst + Number(deliveryFee) - discount, 0);

  const productDiscount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.discount || 0) * item.qty, 0),
    [cart],
  );

  /* ================= QTY ================= */
  const increaseQty = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index && item.qty < item.stock
          ? { ...item, qty: item.qty + 1 }
          : item,
      ),
    );
  };

  const decreaseQty = (index) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const resetCartPanel = () => {
    setCart([]);
    setCustomer({ name: "", phone: "" });
    setSelectedCustomer(null);
    setPendingPhone("");
    setOrderHistory([]);
    setDiscount(0);
    setPaymentMode("cash");
    setGivenAmount("");
    setBalance(0);
    setShowQrCode(false);
    setQrPaymentConfirmed(false);
  };

  /* ================= CREATE ORDER (Cash or QR) ================= */
  const handleCreateOrder = async () => {
    if (!customer.name) {
      alert("Enter customer name");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (paymentMode === "cash") {
      if (!givenAmount) {
        alert("Enter given amount");
        return;
      }

      if (Number(givenAmount) < total) {
        alert("Given amount is less than total");
        return;
      }
    }

    const payload = {
      customer_id: selectedCustomer?.id || null,
      customer_type: "normal customer",
      address_id: null,
      new_address: null,

      payment_method: paymentMode,
      paid_amount:
        paymentMode === "cash" ? Number(givenAmount) : Number(total.toFixed(2)),

      subtotal: subtotal,
      discount_total: discount,
      tax_total: gst,
      delivery_fee: deliveryFee,
      grand_total: total,

      customer_name: customer.name,
      customer_phone: customer.phone,
      address_snapshot: null,

      items: cart.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variation_id,
        qty: item.qty,
        barcode_id: item.barcode_id ?? null,
        // Snapshot: freeze billing values at the time of order creation
        product_name: item.product_name,
        variation_name: item.variation_name,
        price: Number(item.price) || 0,
        MRP: Number(item.mrp || item.MRP) || 0,
        discount: Number(item.discount) || 0,
        stock: Number(item.stock) || 1,
        tax: item.tax || null,
      })),
    };

    try {
      setLoading(true);

      const orderRes = await api.post(
        "/admin-dashboard/offline-store/create-order",
        payload,
      );

      if (orderRes.data.success) {
        const orderData = orderRes.data.data;
        alert(`Order Created: ${orderData.invoice_number}`);
        // Build receipt data from frontend state + API response
        printReceipt({
          invoice_number: orderData.invoice_number,
          created_at: new Date().toISOString(),
          customer_name: customer.name,
          customer_phone: customer.phone,
          payment_method: paymentMode,
          subtotal: subtotal,
          discount_total: productDiscount,
          billed_discount: discount,
          delivery_charge: deliveryFee,
          tax_total: gst,
          grand_total: total,
          paid_amount: paymentMode === "cash" ? Number(givenAmount) : total,
          change_amount: orderData.change_amount || 0,
          items: cart.map((item) => ({
            product_name: item.product_name,
            variant_name: item.variation_name,
            price: Number(item.price) || 0,
            MRP: Number(item.mrp || item.MRP) || 0,
            discount: Number(item.discount) || 0,
            qty: item.qty,
            total: (Number(item.price) - Number(item.discount)) * item.qty,
          })),
        });
        setCart([]);
        setGivenAmount("");
        setBalance(0);
        // Delay reload to allow print dialog to open
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert(orderRes.data.message);
      }
    } catch (err) {
      console.error("Order error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to process order",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= GENERATE UPI QR CODE STRING ================= */
  const getUpiQrString = () => {
    const upiString = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=Sri%20Devi%20Herbals&am=${total.toFixed(2)}&cu=INR&tn=Order%20${Date.now()}`;
    return upiString;
  };

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="flex h-screen w-full max-w-full flex-col overflow-y-auto border-l bg-white md:w-[760px] md:min-w-[760px] md:max-w-[760px] md:shrink-0">
      {/* HEADER */}
      <div className="border-b bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Items:{" "}
            {cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}
          </span>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="space-y-2 border-b p-2.5">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={customer.phone}
            onChange={async (e) => {
              const val = e.target.value.replace(/\D/g, "");

              if (val.length <= 10) {
                setCustomer((p) => ({ ...p, phone: val }));
              }

              if (val.length === 10) {
                try {
                  setSearchLoading(true);

                  const res = await api.get(
                    `/admin-dashboard/offline-store/search-user?phone=${val}`,
                  );

                  if (res.data.success && res.data.data) {
                    const user = res.data.data;

                    setSelectedCustomer(user);
                    setCustomer((p) => ({
                      ...p,
                      name: user.name,
                    }));
                    setOrderHistory(user.orders || []);
                  } else {
                    setSelectedCustomer(null);
                    setPendingPhone(val);
                    setShowAddCustomerPopup(true);
                  }
                } catch (err) {
                  setSelectedCustomer(null);
                  setPendingPhone(val);
                  setShowAddCustomerPopup(true);
                } finally {
                  setSearchLoading(false);
                }
              }
            }}
            placeholder="Mobile No"
            className="h-9 w-full rounded-lg border px-2 text-xs"
            disabled={searchLoading}
          />

          <input
            value={customer.name}
            disabled={!!selectedCustomer}
            onChange={(e) =>
              setCustomer((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Name"
            className={`h-9 w-full rounded-lg border px-2 text-xs ${
              selectedCustomer ? "cursor-not-allowed bg-gray-100" : ""
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {orderHistory.length > 0 && (
            <button
              onClick={() => setShowOrderHistory(true)}
              className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
            >
              <span className="mr-1.5 text-xs">History</span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                {orderHistory.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="min-h-[360px] flex-1 p-2">
        <div className="rounded-xl border border-slate-200">
          <table className="w-full table-fixed text-[10px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-2 py-2 text-left">Item</th>
                <th className="px-2 py-2 text-right">MRP</th>
                <th className="px-2 py-2 text-right">Disc</th>
                <th className="px-2 py-2 text-right">Rate</th>
                <th className="px-2 py-2 text-right">GST</th>
                <th className="px-2 py-2 text-center">Qty</th>
                <th className="px-2 py-2 text-right">Total</th>
                <th className="px-2 py-2 text-center">Del</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No items added yet.
                  </td>
                </tr>
              ) : (
                cart.map((item, i) => {
                  const price = Number(item.price) || 0;
                  const mrp = Number(item.mrp || item.MRP) || 0;
                  const discount = Number(item.discount) || 0;
                  const gstPercent =
                    item.tax?.gst_enabled && item.tax?.gst_type === "exclusive"
                      ? Number(item.tax?.gst_percent) || 0
                      : 0;
                  const gstPerUnit = (price * gstPercent) / 100;
                  const finalPrice = price + gstPerUnit;
                  const lineTotal = finalPrice * (Number(item.qty) || 0);

                  return (
                    <tr
                      key={i}
                      className="border-t border-slate-100 align-middle"
                    >
                      <td className="px-2 py-1">
                        <p className="truncate font-medium text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {item.variation_name}
                        </p>
                      </td>
                      <td className="px-2 py-1 text-right text-slate-600">
                        {mrp > 0 ? `Rs ${mrp.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-2 py-1 text-right text-rose-600">
                        {discount > 0 ? `Rs ${discount.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-2 py-1 text-right font-semibold text-slate-800">
                        Rs {price.toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-right text-emerald-700">
                        {gstPercent > 0 ? `${gstPercent.toFixed(0)}%` : "-"}
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => decreaseQty(i)}
                            className="h-5 w-5 rounded border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-4 text-center text-[10px] font-semibold leading-none">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => increaseQty(i)}
                            className="h-5 w-5 rounded border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-right font-semibold text-slate-900">
                        Rs {lineTotal.toFixed(2)}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() =>
                            setCart((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="rounded bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="border-t p-3 space-y-2 text-sm">
        <Row label="Subtotal" value={`₹ ${subtotal.toFixed(2)}`} />

        <div className="flex justify-between items-center">
          <span>Bill Discount</span>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-right"
          />
        </div>

        <div className="flex justify-between items-center">
          <span>Delivery Fee</span>
          <input
            type="number"
            min={0}
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-right"
          />
        </div>

        <div className="flex justify-between items-center">
          <span>Product Discount</span>
          <span className="text-red-600 font-semibold">
            ₹ {productDiscount.toFixed(2)}
          </span>
        </div>

        <Row label="GST" value={`₹ ${gst.toFixed(2)}`} />
        <Row label="Total" value={`₹ ${total.toFixed(2)}`} />
      </div>

      {/* PAYMENT */}
      <div className="border-t p-3">
        {/* Payment Method Selection */}
        <div className="space-y-2 mb-3">
          <label className="text-xs font-semibold text-gray-600">
            Payment Method
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPaymentMode("cash");
                setShowQrCode(false);
                setQrPaymentConfirmed(false);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                paymentMode === "cash"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cash
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMode("qr");
                setShowQrCode(true);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                paymentMode === "qr"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR Code
            </button>
          </div>
        </div>

        {/* CASH: Given Amount */}
        {paymentMode === "cash" && (
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span>Given Amount</span>

              <input
                type="number"
                value={givenAmount}
                onChange={(e) => {
                  setGivenAmount(e.target.value);
                  calculateBalance(e.target.value);
                }}
                className="w-28 border rounded px-2 py-1 text-right"
              />
            </div>

            <div className="flex justify-between items-center">
              <span>Balance</span>

              <span
                className={`font-semibold ${
                  balance < 0 ? "text-red-600" : "text-green-700"
                }`}
              >
                ₹ {balance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* QR CODE: Show QR image */}
        {paymentMode === "qr" && showQrCode && (
          <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-center">
            <p className="text-xs font-semibold text-blue-800 mb-3">
              Scan QR Code to Pay ₹ {total.toFixed(2)}
            </p>

            <div className="inline-block rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getUpiQrString())}`}
                alt="UPI QR Code"
                className="h-[200px] w-[200px]"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<p class="text-xs text-slate-400 p-8">QR code unavailable</p>';
                }}
              />
            </div>

            <p className="mt-2 text-[11px] text-blue-600">
              UPI ID: <span className="font-semibold">{merchantUpiId}</span>
            </p>
            <p className="text-[10px] text-blue-500 mt-1">
              Customer scans this QR with any UPI app (Google Pay, PhonePe, Paytm, etc.)
            </p>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="qrConfirmed"
                checked={qrPaymentConfirmed}
                onChange={(e) => setQrPaymentConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="qrConfirmed" className="text-xs text-slate-700">
                I confirm the customer has paid via QR
              </label>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {paymentMode === "cash" ? (
          <button
            disabled={cart.length === 0 || !customer.name || loading}
            onClick={handleCreateOrder}
            className="w-full bg-green-700 text-white py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              `Collect Cash ₹ ${total.toFixed(2)}`
            )}
          </button>
        ) : (
          <button
            disabled={cart.length === 0 || !customer.name || loading || !qrPaymentConfirmed}
            onClick={handleCreateOrder}
            className="w-full bg-blue-700 text-white py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Order...
              </>
            ) : (
              `Confirm Payment & Create Order ₹ ${total.toFixed(2)}`
            )}
          </button>
        )}
      </div>

      {/* ── ADD CUSTOMER POPUP ── */}
      {showAddCustomerPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4">
            <h3 className="text-lg font-semibold text-center">
              Customer Not Found
            </h3>

            <p className="text-sm text-gray-600 text-center">
              Add this customer with phone <br />
              <b>{pendingPhone}</b> ?
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="h-9 w-full rounded-lg border px-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Gender <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  value={newCustomerGender}
                  onChange={(e) => setNewCustomerGender(e.target.value)}
                  className="h-9 w-full rounded-lg border px-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowAddCustomerPopup(false);
                  setNewCustomerName("");
                  setNewCustomerGender("");
                  setCustomer((prev) => ({ ...prev, phone: "" }));
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await api.post(
                      "/admin-dashboard/customers/store",
                      {
                        phone: pendingPhone,
                        name: newCustomerName.trim() || "New Customer",
                        gender: newCustomerGender || null,
                      },
                    );

                    if (res.data.success) {
                      const user = res.data.data;

                      setSelectedCustomer(user);

                      setCustomer({
                        phone: user.phone,
                        name: user.name,
                      });
                      setOrderHistory([]);

                      setNewCustomerName("");
                      setNewCustomerGender("");
                      setShowAddCustomerPopup(false);
                    }
                  } catch (err) {
                    alert("Failed to create customer");
                  }
                }}
                className="px-4 py-2 bg-green-700 text-white rounded"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER HISTORY MODAL ── */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Purchase History
                </h3>
                <p className="text-xs text-slate-500">
                  {orderHistory.length} previous order
                  {orderHistory.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setShowOrderHistory(false)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {orderHistory.map((order) => (
              <div
                key={order.id}
                className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Invoice #{order.invoice_number}
                    </p>
                    <p className="text-xs text-slate-500">Date: {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Grand Total</p>
                    <p className="text-base font-semibold text-emerald-700">
                      ₹ {order.grand_total}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-800">
                              {item.product_name}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600">
                            {item.qty}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-800">
                            ₹ {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {orderHistory.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No purchase history found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Completed orders will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL SCREEN LOADER */}
      {(loading || searchLoading) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-700 font-medium">
              {searchLoading ? "Searching customer..." : "Processing..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const printReceipt = (order) => {
  console.log("PRINTING RECEIPT FOR ORDER:", order);

  const dateTime = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : new Date().toLocaleString();

  // Use top-level customer_name/phone or fallback to shipping_address_snapshot
  const customerName = order.customer_name || order.shipping_address_snapshot?.name || "Walk-in Customer";
  const customerPhone = order.customer_phone || order.shipping_address_snapshot?.phone || "-";

  const addr = order.shipping_address_snapshot || {};
  const address = [
    addr.address || order.address,
    addr.city || order.city,
    addr.state || order.state,
    addr.pincode || order.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const itemsHtml = (order.items || [])
    .map((item) => {
      const name =
        item.product_name.length > 18
          ? item.product_name.substring(0, 18) + ".."
          : item.product_name;

      const qty = Number(item.qty ?? item.quantity ?? 1);
      const HSN = item.hsn ?? item.hsn ?? "N/A";
      const discountPerItem = Number(item.total_discount ?? 0);
      const total = Number(item.total ?? 0);

      const lineDiscount = discountPerItem;
      const lineAmount = total + discountPerItem;

      return `
<tr>
<td class="item">${name}</td>
<td class="item">${HSN}</td>
<td class="right qty">${qty}</td>
<td class="right mrp">${lineAmount.toFixed(2)}</td>
<td class="right disc">₹${lineDiscount.toFixed(2)}</td>
<td class="right amt">₹${total.toFixed(2)}</td>
</tr>
`;
    })
    .join("");

  const subtotal = Number(order.subtotal ?? order.sub_total ?? 0).toFixed(2);
  const discountTotal = Number(order.discount_total ?? order.discount ?? 0).toFixed(2);
  const taxTotal = Number(order.tax_total ?? order.tax ?? 0).toFixed(2);
  const deliveryCharge = Number(order.delivery_charge ?? order.delivery_fee ?? order.deliveryFee ?? 0).toFixed(2);
  const billDiscount = Number(order.billed_discount ?? 0).toFixed(2);
  const grandTotal = Number(order.grand_total ?? order.total ?? 0).toFixed(2);
  const paidAmount = Number(order.paid_amount ?? grandTotal).toFixed(2);
  const changeAmount = Number(order.change_amount ?? 0).toFixed(2);

  const content = `
<html>
<head>

<style>

body{
font-family: monospace;
width:78mm;
margin:0;
padding:8px;
font-size:12px;
}

.header{
text-align:center;
}

.store{
font-size:16px;
font-weight:bold;
}

.tagline{
font-size:11px;
margin-top:2px;
}

.meta{
margin-top:6px;
font-size:11px;
}

table{
width:100%;
border-collapse:collapse;
table-layout:fixed;
margin-top:5px;
}

th, td{
padding:3px 2px;
white-space:nowrap;
}

.item{
width:32%;
overflow:hidden;
text-overflow:ellipsis;
}


.hsn{
width:15%;
overflow:hidden;
text-overflow:ellipsis;
}

.qty{
width:8%;
}

.mrp{
width:19%;
}

.disc{
width:19%;
}

.amt{
width:19%;
}

.right{
text-align:right;
}

hr{
border:none;
border-top:1px dashed black;
margin:6px 0;
}

.summary td{
padding:2px 0;
}

.total{
font-weight:bold;
border-top:1px dashed black;
}

.footer{
text-align:center;
font-size:10px;
margin-top:6px;
}

</style>

</head>

<body>

<div class="header">
<div class="store">Sri Devi Herbals</div>
<div class="tagline">Thank You Visit Again</div>
</div>

<hr>

<div class="meta">
Invoice : ${order.invoice_number}<br>
Date : ${dateTime}<br>
Customer : ${customerName}<br>
Phone : ${customerPhone}<br>
${address ? `Address : ${address}<br>` : ""}
Payment : ${order.payment_method ?? "Cash"}
</div>

<hr>

<table>
<thead>
<tr>
<th class="item">Item</th>
<th class="hsn">HSN</th>
<th class="right qty">Qty</th>
<th class="right mrp">MRP</th>
<th class="right disc">Disc</th>
<th class="right amt">Amt</th>
</tr>
</thead>

<tbody>
${itemsHtml}
</tbody>
</table>

<hr>

<table class="summary">

<tr>
<td>Subtotal</td>
<td class="right">₹${subtotal}</td>
</tr>

<tr>
<td>Product Discount</td>
<td class="right">-₹${discountTotal}</td>
</tr>

<tr>
<td>Bill Discount</td>
<td class="right">-₹${billDiscount}</td>
</tr>

<tr>
<td>GST</td>
<td class="right">₹${taxTotal}</td>
</tr>

<tr>
<td>Delivery Fee (+)</td>
<td class="right">₹${deliveryCharge}</td>
</tr>

<tr class="total">
<td><b>Total</b></td>
<td class="right"><b>₹${grandTotal}</b></td>
</tr>

</table>

<hr>

<div class="footer">
Powered by Sri Devi Herbals POS
</div>

</body>

</html>
`;

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";

  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow.document;

  doc.open();
  doc.write(content);
  doc.close();

  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();

  setTimeout(() => {
    document.body.removeChild(printFrame);
  }, 1000);
};