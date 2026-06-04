import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import publicApi from "../api/publicAxios";

/* ─────────────────── Payment Gateway Cards ─────────────────── */
const GATEWAYS = [
  {
    key: "razorpay",
    label: "Razorpay",
    icon: "💳",
    desc: "Pay via Credit/Debit Card, Net Banking, UPI & Wallets",
  },
  {
    key: "phonepe",
    label: "PhonePe",
    icon: "📱",
    desc: "Pay using PhonePe UPI",
  },
  {
    key: "payu",
    label: "PayU",
    icon: "🏦",
    desc: "Pay via PayU (Card / Net Banking / UPI)",
  },
  {
    key: "upi_collect",
    label: "UPI Collect",
    icon: "📲",
    desc: "Pay using any UPI App (GPay, PhonePe, Paytm)",
  },
];

function formatPrice(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function InvoicePayment() {
  const { token } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment flow
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  /* ── Load Invoice ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    publicApi
      .get(`/invoice/${token}`)
      .then((res) => {
        if (res.data.success) {
          setInvoice(res.data.data);
        } else {
          setError(res.data.message || "Failed to load invoice");
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load invoice details",
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  /* ── Initiate Payment ── */
  const handleInitiatePayment = async (gateway) => {
    setSelectedGateway(gateway);
    setPaymentLoading(true);
    setPaymentError("");
    setPaymentResult(null);

    try {
      const res = await publicApi.post("/invoice/initiate-payment", {
        invoice_token: token,
        gateway: gateway,
      });

      if (res.data.success) {
        const data = res.data.data;

        console.log("Payment initiation response:", data);

        // Handle different gateways
        if (gateway === "razorpay" && data.razorpay_order_id) {
          // 🆕 Razorpay Order (modal checkout) — open dialog box on same page
          openRazorpayCheckout(data);
        } else if (gateway === "phonepe" && data.payment_link) {
          // PhonePe — redirect to payment link
          window.open(data.payment_link, "_blank");
          setPaymentResult({
            type: "payment_link",
            payment_link: data.payment_link,
            gateway: "phonepe",
          });
        } else if (gateway === "payu" && data.payu_data) {
          // PayU — auto-submit form
          submitPayuForm(data.payu_data);
        } else if (gateway === "upi_collect" && data.upi_intent) {
          // UPI Collect — show UPI intent
          setPaymentResult({
            type: "upi_intent",
            upi_intent: data.upi_intent,
            amount: data.amount,
          });
        } else if (data.payment_link) {
          // Fallback — redirect
          window.open(data.payment_link, "_blank");
          setPaymentResult({
            type: "payment_link",
            payment_link: data.payment_link,
            gateway: gateway,
          });
        } else {
          setPaymentResult({
            type: "initiated",
            message:
              "Payment initiated successfully! You will receive the payment link on WhatsApp.",
          });
        }
      } else {
        setPaymentError(res.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      setPaymentError(
        err.response?.data?.message || "Failed to initiate payment",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ── Razorpay Checkout ── */
  // const openRazorpayCheckout = (data) => {
  //   if (!window.Razorpay) {
  //     setPaymentError("Razorpay SDK not loaded. Please refresh and try again.");
  //     return;
  //   }

  //   const options = {
  //     key: data.merchant_key,
  //     amount: data.amount * 100, // Razorpay expects paise
  //     currency: "INR",
  //     name: "Sri Devi Herbals",
  //     description: `Invoice #${data.invoice_number || ""}`,
  //     order_id: data.razorpay_order_id,
  //     handler: function (response) {
  //       setPaymentResult({
  //         type: "razorpay_success",
  //         razorpay_payment_id: response.razorpay_payment_id,
  //         razorpay_order_id: response.razorpay_order_id,
  //         razorpay_signature: response.razorpay_signature,
  //       });
  //     },
  //     modal: {
  //       ondismiss: function () {
  //         setPaymentError("Payment cancelled");
  //         setPaymentLoading(false);
  //       },
  //     },
  //     theme: {
  //       color: "#16a34a",
  //     },
  //   };

  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  const openRazorpayCheckout = (data) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: data.merchant_key,
      amount: Number(data.amount) * 100,
      currency: "INR",
      name: "Sri Devi Herbals",
      description: `Invoice #${data.invoice_number || ""}`,
      order_id: data.razorpay_order_id,

      handler: async function (response) {
        console.log(response);

        // Call backend to verify payment signature & mark sale as paid
        try {
          const verifyRes = await publicApi.post("/invoice/verify-payment", {
            invoice_token: token,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setPaymentResult({
            type: "razorpay_success",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            verified: true,
          });
        } catch (err) {
          // Payment went through on Razorpay but verification failed
          setPaymentResult({
            type: "razorpay_success",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            verified: false,
          });
          setPaymentError(
            "Payment processed! Admin will verify manually. Contact support if not updated.",
          );
        }
      },

      prefill: {
        name: invoice.customer_name,
        contact: invoice.customer_phone,
      },

      theme: {
        color: "#16a34a",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.log(response.error);
      alert("Payment Failed");
    });

    rzp.open();
  };
  /* ── PayU auto-submit form ── */
  const submitPayuForm = (payuData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = payuData.action;
    form.target = "_blank";

    Object.entries(payuData).forEach(([key, value]) => {
      if (key === "action") return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setPaymentResult({
      type: "payu_redirected",
      message: "Redirecting to PayU...",
    });
  };

  // ──── Format Address ────
  const formatAddress = (addr) => {
    if (!addr) return "—";
    const parts = [
      addr.door_no,
      addr.address,
      addr.street,
      addr.landmark,
      addr.area,
      addr.city,
      addr.state,
      addr.pincode,
    ].filter(Boolean);
    return parts.join(", ") || "—";
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-400">
            If you need help, please contact Sri Devi Herbals support.
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Header ── */}
        <div className="bg-white rounded-t-xl shadow-sm p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                🌿 Sri Devi Herbals
              </h1>
              <p className="text-sm text-gray-500 mt-1">Invoice Payment</p>
            </div>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="bg-white shadow-sm p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Order Summary
          </h2>

          {/* Customer Details */}
          <div className="mb-4 bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-700">
              {invoice.customer_name || "Customer"}
            </p>
            <p className="text-sm text-gray-500">
              {invoice.customer_phone || ""}
            </p>
            {invoice.address && (
              <p className="text-sm text-gray-500 mt-1">
                📍 {formatAddress(invoice.address)}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.product_name}
                    </p>
                    {item.variation_name && (
                      <p className="text-sm text-gray-500">
                        {item.variation_name}
                      </p>
                    )}

                    <p className="text-sm text-gray-400">
                      Qty: {item.qty} × {formatPrice(item.price)}
                    </p>

                    {Number(item.discount) > 0 && (
                      <p className="text-sm text-green-600">
                        Discount: {formatPrice(item.discount)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatPrice(item.price)}
                    </p>

                    {Number(item.discount) > 0 && (
                      <p className="text-xs text-green-600">
                        Saved {formatPrice(item.discount)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items in invoice</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(invoice.subtotal)}</span>
            </div>
            {invoice.discount_total > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(invoice.discount_total)}</span>
              </div>
            )}
            {invoice.tax_total > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(invoice.tax_total)}</span>
              </div>
            )}
            {invoice.delivery_fee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatPrice(invoice.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-green-600">
                {formatPrice(invoice.grand_total)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Payment Options ── */}
        {!paymentResult && (
          <div className="bg-white shadow-sm p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              💰 Choose Payment Method
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Select your preferred payment method to complete the payment of{" "}
              <strong className="text-green-600">
                {formatPrice(invoice.grand_total)}
              </strong>
              .
            </p>

            <div className="space-y-3">
              {GATEWAYS.map((gw) => (
                <button
                  key={gw.key}
                  onClick={() => handleInitiatePayment(gw.key)}
                  disabled={paymentLoading && selectedGateway === gw.key}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gw.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{gw.label}</p>
                      <p className="text-sm text-gray-500">{gw.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Loading */}
            {paymentLoading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-blue-700">
                  Initiating payment via{" "}
                  {GATEWAYS.find((g) => g.key === selectedGateway)?.label}...
                </p>
              </div>
            )}

            {/* Payment Error */}
            {paymentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {paymentError}
              </div>
            )}
          </div>
        )}

        {/* ── Payment Result ── */}
        {paymentResult && (
          <div className="bg-white shadow-sm p-6 border-b border-gray-100">
            {paymentResult.type === "razorpay_success" ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-green-600 mb-4">
                  Your payment has been confirmed. Thank you for your order!
                </p>
                <p className="text-xs text-gray-500">
                  Payment ID: {paymentResult.razorpay_payment_id}
                </p>
              </div>
            ) : paymentResult.type === "payment_link" ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-3xl mb-2">🔗</div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Payment Link Generated
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                  A payment window has been opened. Complete your payment there.
                </p>
                {paymentResult.payment_link && (
                  <a
                    href={paymentResult.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Payment Page
                  </a>
                )}
              </div>
            ) : paymentResult.type === "upi_intent" ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">📲</div>
                  <h3 className="font-semibold text-purple-800">
                    UPI Collect Request
                  </h3>
                  <p className="text-sm text-purple-600">
                    Open your UPI app and pay{" "}
                  </p>
                </div>
                {paymentResult.upi_intent && (
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">
                      UPI Intent (Click to pay):
                    </p>
                    <a
                      href={paymentResult.upi_intent}
                      className="text-sm text-blue-600 break-all hover:underline"
                    >
                      {paymentResult.upi_intent}
                    </a>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3 text-center">
                  You will also receive the payment link on WhatsApp.
                </p>
              </div>
            ) : paymentResult.type === "payu_redirected" ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-3xl mb-2">🏦</div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Redirecting to PayU
                </h3>
                <p className="text-sm text-blue-600">
                  Please complete your payment on the PayU page.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="font-semibold text-green-800 mb-2">
                  {paymentResult.message || "Payment Initiated"}
                </h3>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="bg-white rounded-b-xl shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400">
            🌿 Sri Devi Herbals — Powered by Limra
          </p>
        </div>
      </div>
    </div>
  );
}
