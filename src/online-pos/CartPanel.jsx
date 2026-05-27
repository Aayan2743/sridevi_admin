import { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import PaymentOptionsModal from "./components/PaymentOptionsModal";


export default function CartPanel({ cart = [], setCart }) {
  const { user, can } = useAuth();
  /* (can unused now, kept for future extensibility) */
  void can;

  /* ================= CUSTOMER ================= */
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [givenAmount, setGivenAmount] = useState("");
  const [balance, setBalance] = useState(0);

  // const [initiatedPayment, setInitiatedPayment]

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
  const [paymentMode, setPaymentMode] = useState("pay");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  /* ================= UPI COLLECT ================= */
  const [customerVpa, setCustomerVpa] = useState("");
  const [upiCollectStatus, setUpiCollectStatus] = useState(null); // 'sending' | 'pending' | 'approved' | 'failed'
  const [upiCollectSaleId, setUpiCollectSaleId] = useState(null);

  /* ================= INITIATED PAYMENT TRACKING ================= */
  const [initiatedPayment, setInitiatedPayment] = useState(null);

  /* ================= TELE-CALLER FLOW: ADDRESS & OTP ================= */
  const [deliveryDoorNo, setDeliveryDoorNo] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDisplay, setOtpDisplay] = useState("");  // auto-displayed from backend
  const [pendingId, setPendingId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  /* ================= MANUAL CONFIRMATION (Already Paid Directly) ================= */
  const [manualPaymentMethod, setManualPaymentMethod] = useState("cash_collected");

  /* ================= DRAFT ORDERS ================= */
  const [showDraftOrders, setShowDraftOrders] = useState(false);
  const [draftOrders, setDraftOrders] = useState([]);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftDateFilter, setDraftDateFilter] = useState("");        // '' | 'today' | 'yesterday' | 'custom'
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [draftStatusFilter, setDraftStatusFilter] = useState("draft"); // 'draft' | 'converted' | 'all'
  const [draftPage, setDraftPage] = useState(1);
  const [draftPagination, setDraftPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [draftCancelLoading, setDraftCancelLoading] = useState(false);
  const [draftSendDetailsLoading, setDraftSendDetailsLoading] = useState(false);
  const [showAllDrafts, setShowAllDrafts] = useState(false); // true = show all telecallers' drafts; false = only mine

  /* ================= AUTO-FILL CITY/STATE FROM PINCODE (proxy via our backend) ================= */
  useEffect(() => {
    if (deliveryPincode.length === 6) {
      api
        .get(`/admin-dashboard/pos/lookup-pincode/${deliveryPincode}`)
        .then((res) => {
          const data = res.data;
          if (Array.isArray(data) && data?.[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            if (postOffice) {
              setDeliveryCity(postOffice.District || "");
              setDeliveryState(postOffice.State || "");
            }
          }
        })
        .catch(() => {
          /* silently ignore — user can still type manually */
        });
    }
  }, [deliveryPincode]);

  /* ================= BUILD FULL ADDRESS STRING ================= */
  const buildAddressString = () => {
    return [deliveryDoorNo, deliveryStreet, deliveryLandmark, deliveryArea]
      .filter(Boolean)
      .join(", ");
  };

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
        return total + ((price * qty) * gstPercent) / 100;
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
    setPaymentMode("pay");
    setGivenAmount("");
    setBalance(0);
    setShowPaymentOptions(false);
    setInitiatedPayment(null);
    setCustomerVpa("");
    setUpiCollectStatus(null);
    setUpiCollectSaleId(null);
    setDeliveryAddress("");
    setDeliveryCity("");
    setDeliveryState("");
    setDeliveryPincode("");
    setAltPhone("");
    setOtp("");
    setOtpDisplay("");
    setPendingId(null);
    setOtpSent(false);
    setOtpVerified(false);
  };

  /* ================= SUBMIT (CASH ONLY) ================= */
  const handleSubmit = async () => {
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
        paymentMode === "cash"
          ? Number(givenAmount)
          : Number(total.toFixed(2)),

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
      })),
    };

    try {
      setLoading(true);

      // CASH PAYMENT – create order directly
      if (paymentMode === "cash") {
        const orderRes = await api.post(
          "/admin-dashboard/pos/create-order",
          payload,
        );

        if (orderRes.data.success) {
          alert(`Order Created: ${orderRes.data.data.invoice_number}`);
          printReceipt(orderRes.data.data);
          window.location.reload();
          setCart([]);
          setGivenAmount("");
          setBalance(0);
        } else {
          alert(orderRes.data.message);
        }
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

  /* ================= TELE-CALLER: SEND OTP ================= */
  const handleSendOtp = async () => {
    if (!deliveryDoorNo && !deliveryStreet && !deliveryArea) {
      alert("Please fill at least Door No, Street, or Area in address");
      return;
    }
    if (!deliveryCity || !deliveryState || !deliveryPincode) {
      alert("Please fill in City, State, and Pincode");
      return;
    }

    if (!customer.phone || !isValidPhone(customer.phone)) {
      alert("Enter a valid customer phone number");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setOtpLoading(true);

      const res = await api.post("/admin-dashboard/pos/send-order-otp", {
        customer_id: selectedCustomer?.id || null,
        customer_name: customer.name,
        customer_phone: customer.phone,

        items: cart.map((item) => ({
          variant_id: item.variation_id,
          qty: item.qty,
        })),

        address_snapshot: {
          address: buildAddressString(),
          door_no: deliveryDoorNo,
          street: deliveryStreet,
          landmark: deliveryLandmark,
          area: deliveryArea,
          city: deliveryCity,
          state: deliveryState,
          pincode: deliveryPincode,
        },

        subtotal: subtotal,
        discount_total: discount,
        tax_total: gst,
        delivery_fee: deliveryFee,
        grand_total: total,
      });

      if (res.data.success) {
        setPendingId(res.data.pending_id);
        setOtpSent(true);
        setOtpDisplay(res.data.otp || "");
        alert("✅ OTP sent to customer's WhatsApp!");
      } else {
        alert(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Failed to send OTP",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= TELE-CALLER: RESEND OTP WITH UPDATED DETAILS ================= */
  const handleResendOtp = async () => {
    if (!pendingId) {
      alert("No pending order to update");
      return;
    }
    if (!deliveryDoorNo && !deliveryStreet && !deliveryArea) {
      alert("Please fill at least Door No, Street, or Area in address");
      return;
    }
    if (!deliveryCity || !deliveryState || !deliveryPincode) {
      alert("Please fill in City, State, and Pincode");
      return;
    }
    if (!customer.phone || !isValidPhone(customer.phone)) {
      alert("Enter a valid customer phone number");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setOtpLoading(true);

      const res = await api.post("/admin-dashboard/pos/resend-order-otp", {
        pending_id: pendingId,
        customer_id: selectedCustomer?.id || null,
        customer_name: customer.name,
        customer_phone: customer.phone,

        items: cart.map((item) => ({
          variant_id: item.variation_id,
          qty: item.qty,
        })),

        address_snapshot: {
          address: buildAddressString(),
          door_no: deliveryDoorNo,
          street: deliveryStreet,
          landmark: deliveryLandmark,
          area: deliveryArea,
          city: deliveryCity,
          state: deliveryState,
          pincode: deliveryPincode,
        },

        subtotal: subtotal,
        discount_total: discount,
        tax_total: gst,
        delivery_fee: deliveryFee,
        grand_total: total,
      });

      if (res.data.success) {
        setPendingId(res.data.pending_id);
        setOtpDisplay(res.data.otp || "");
        setOtp("");            // clear old OTP input
        setOtpVerified(false); // reset verification status
        alert("✅ OTP resent with updated order details to customer's WhatsApp!");
      } else {
        alert(res.data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          "Failed to resend OTP",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= TELE-CALLER: VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);

      const res = await api.post("/admin-dashboard/pos/verify-order-otp", {
        pending_id: pendingId,
        otp: otp,
      });

      if (res.data.success) {
        setOtpVerified(true);
        alert("✅ OTP verified successfully!");
      } else {
        alert(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert(
        err.response?.data?.message || "OTP verification failed",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* ================= TELE-CALLER: SEND PAYMENT LINK (NO SALE — PAYMENT LINK ONLY) ================= */
  const handleSendPaymentLink = async () => {
    if (!pendingId || !otpVerified) {
      alert("Please verify OTP first");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/pos/send-payment-link-only",
        {
          pending_id: pendingId,
          alt_phone: altPhone || null,
          customer_id: selectedCustomer?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          delivery_fee: deliveryFee,
          address_snapshot: {
            address: buildAddressString(),
            door_no: deliveryDoorNo,
            street: deliveryStreet,
            landmark: deliveryLandmark,
            area: deliveryArea,
            city: deliveryCity,
            state: deliveryState,
            pincode: deliveryPincode,
          },
          discount_total: discount,
          tax_total: gst,
          grand_total: total,
          subtotal: subtotal,
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variation_id,
            qty: item.qty,
            barcode_id: item.barcode_id ?? null,
          })),
        },
      );

      if (res.data.success) {
        const data = res.data.data;
        alert(`✅ Payment link sent!`);

        // Show the initiated payment panel for payment tracking
        // Stores payment_link_id (NOT sale_id) — order is created only after payment confirmed
        setInitiatedPayment({
          payment_link_id: data.payment_link_id,
          payment_link: data.payment_link,
          amount: data.amount,
          status: "pending",
          gateway: "razorpay",
          app_key: "razorpay",
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
        });
      } else {
        alert(res.data.message || "Failed to send payment link");
      }
    } catch (err) {
      console.error("Send payment link error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send payment link",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= TELE-CALLER: SEND ORDER DETAILS LINK ================= */
  const handleSendOrderDetailsLink = async () => {
    if (!pendingId || !otpVerified) {
      alert("Please verify OTP first");
      return;
    }

    if (!customer.name) {
      alert("Enter customer name");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/pos/send-order-details-link",
        {
          pending_id: pendingId,
          alt_phone: altPhone || null,
          customer_id: selectedCustomer?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          delivery_fee: deliveryFee,
          address_snapshot: {
            address: buildAddressString(),
            door_no: deliveryDoorNo,
            street: deliveryStreet,
            landmark: deliveryLandmark,
            area: deliveryArea,
            city: deliveryCity,
            state: deliveryState,
            pincode: deliveryPincode,
          },
          discount_total: discount,
          tax_total: gst,
          grand_total: total,
          subtotal: subtotal,
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variation_id,
            qty: item.qty,
            barcode_id: item.barcode_id ?? null,
          })),
        },
      );

      if (res.data.success) {
        const link = res.data.data.invoice_url;
        alert(`✅ Order details link sent to ${customer.phone}\n\nLink: ${link}`);
      } else {
        alert(res.data.message || "Failed to send order details link");
      }
    } catch (err) {
      console.error("Send order details link error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send order details link",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= TELE-CALLER: SAVE AS DRAFT ================= */
  const handleSaveDraft = async () => {
    if (!pendingId || !otpVerified) {
      alert("Please verify OTP first");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/pos/create-draft-from-otp",
        {
          pending_id: pendingId,
          alt_phone: altPhone || null,
          customer_id: selectedCustomer?.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          delivery_fee: deliveryFee,
          address_snapshot: {
            address: buildAddressString(),
            door_no: deliveryDoorNo,
            street: deliveryStreet,
            landmark: deliveryLandmark,
            area: deliveryArea,
            city: deliveryCity,
            state: deliveryState,
            pincode: deliveryPincode,
          },
          discount_total: discount,
          tax_total: gst,
          grand_total: total,
          subtotal: subtotal,
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variation_id,
            qty: item.qty,
            barcode_id: item.barcode_id ?? null,
          })),
        },
      );

      if (res.data.success) {
        alert("✅ Order saved as draft. You can follow up later.");
        resetCartPanel();
      } else {
        alert(res.data.message || "Failed to save draft");
      }
    } catch (err) {
      console.error("Save draft error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save draft",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= MODIFY DRAFT: Load draft back into cart ================= */
  const handleLoadDraft = async (draftId) => {
    try {
      setDraftLoading(true);
      const res = await api.get(`/admin-dashboard/pos/draft-order/${draftId}`);
      if (!res.data.success) {
        alert(res.data.message || "Failed to load draft");
        return;
      }

      const data = res.data.data;

      // 1. Restore customer info
      setCustomer({ name: data.customer_name || "", phone: data.customer_phone || "" });
      if (data.customer_id) {
        setSelectedCustomer({ id: data.customer_id, name: data.customer_name, phone: data.customer_phone });
      }
      setAltPhone(data.alt_phone || "");

      // 2. Restore cart items (match the structure used by addVariantToCart)
      if (Array.isArray(data.items)) {
        setCart(
          data.items.map((item) => ({
            product_id:       item.product_id,
            product_name:     item.product_name || "",
            variation_id:     item.variation_id,
            variation_name:   item.variation_name || "",
            price:            Number(item.price) || 0,
            MRP:              Number(item.MRP) || 0,
            discount:         Number(item.discount) || 0,
            stock:            Number(item.stock) || 1,
            qty:              Number(item.qty) || 1,
            tax:              item.tax || null,
            barcode_id:       item.barcode_id || null,
          })),
        );
      }

      // 3. Restore discount and delivery fee
      setDiscount(Number(data.discount_total) || 0);
      setDeliveryFee(Number(data.delivery_fee) || 0);

      // 4. Restore address fields
      const addr = data.address || {};
      setDeliveryDoorNo(addr.door_no || "");
      setDeliveryStreet(addr.street || "");
      setDeliveryLandmark(addr.landmark || "");
      setDeliveryArea(addr.area || "");
      setDeliveryCity(addr.city || "");
      setDeliveryState(addr.state || "");
      setDeliveryPincode(addr.pincode || "");

      // 5. Reset OTP flow state so user can send a new OTP with updated details
      setOtp("");
      setOtpDisplay("");
      setPendingId(null);
      setOtpSent(false);
      setOtpVerified(false);

      // 6. Reset payment state
      setInitiatedPayment(null);
      setPaymentMode("pay");
      setShowPaymentOptions(false);

      // 7. Close the draft modal
      setShowDraftOrders(false);

      alert("✅ Draft loaded. You can now modify the order and send a new OTP.");
    } catch (err) {
      console.error("Load draft error:", err);
      alert(err.response?.data?.message || "Failed to load draft");
    } finally {
      setDraftLoading(false);
    }
  };

  /* ================= FETCH DRAFT ORDERS (with filters/pagination) ================= */
  const handleFetchDrafts = async (page = 1) => {
    try {
      setDraftLoading(true);
      setDraftPage(page);
      const params = new URLSearchParams();
      if (draftSearch) params.append("search", draftSearch);
      if (draftDateFilter) params.append("date_filter", draftDateFilter);
      if (draftDateFilter === "custom") {
        if (draftDateFrom) params.append("date_from", draftDateFrom);
        if (draftDateTo) params.append("date_to", draftDateTo);
      }
      if (draftStatusFilter) params.append("status", draftStatusFilter);
      if (showAllDrafts) {
        params.append("my_drafts", "0");
      } else {
        params.append("my_drafts", "1");
      }
      params.append("page", page);
      params.append("per_page", 15);
      const res = await api.get(`/admin-dashboard/pos/draft-orders?${params.toString()}`);
      if (res.data.success) {
        setDraftOrders(res.data.data || []);
        setDraftPagination(
          res.data.pagination || { current_page: 1, last_page: 1, total: 0 },
        );
        setShowDraftOrders(true);
      } else {
        alert("Failed to load draft orders");
      }
    } catch (err) {
      console.error("Draft fetch error:", err);
      alert("Failed to load draft orders");
    } finally {
      setDraftLoading(false);
    }
  };

  /* ================= CANCEL DRAFT ORDER ================= */
  const handleCancelDraft = async (draftId) => {
    if (!confirm("Are you sure you want to cancel this draft order?")) return;
    try {
      setDraftCancelLoading(true);
      const res = await api.post("/admin-dashboard/pos/cancel-draft-order", {
        draft_id: draftId,
      });
      if (res.data.success) {
        alert("Draft order cancelled successfully");
        handleFetchDrafts(draftPage); // re-fetch current page
      } else {
        alert(res.data.message || "Failed to cancel draft order");
      }
    } catch (err) {
      console.error("Cancel draft error:", err);
      alert(err.response?.data?.message || "Failed to cancel draft order");
    } finally {
      setDraftCancelLoading(false);
    }
  };


  /* ================= MANUAL CONFIRMATION: Create Order Directly (Already Paid) ================= */
  const handleManualConfirm = async () => {
    if (!customer.name) {
      alert("Enter customer name");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!deliveryDoorNo && !deliveryStreet && !deliveryArea) {
      alert("Please fill at least Door No, Street, or Area in address");
      return;
    }
    if (!deliveryCity || !deliveryState || !deliveryPincode) {
      alert("Please fill in City, State, and Pincode");
      return;
    }

    const methodLabels = {
      cash_collected: "Cash Collected",
      direct_link: "Direct Link",
      phonepay: "PhonePe",
      bank_transfer: "Bank Transfer",
    };

    if (!confirm(
      `Create order with MANUAL CONFIRMATION?\n\n` +
      `Payment: ${methodLabels[manualPaymentMethod] || manualPaymentMethod}\n` +
      `Customer: ${customer.name}\n` +
      `Total: ₹${total.toFixed(2)}\n` +
      `Address: ${buildAddressString()}, ${deliveryCity}, ${deliveryState} - ${deliveryPincode}\n\n` +
      `Press OK to confirm order creation.`
    )) return;

    const payload = {
      customer_id: selectedCustomer?.id || null,
      payment_method: manualPaymentMethod,
      paid_amount: Number(total.toFixed(2)),
      subtotal: subtotal,
      discount_total: discount,
      tax_total: gst,
      delivery_fee: deliveryFee,
      grand_total: total,
      customer_name: customer.name,
      customer_phone: customer.phone,
      address_snapshot: {
        address: buildAddressString(),
        door_no: deliveryDoorNo,
        street: deliveryStreet,
        landmark: deliveryLandmark,
        area: deliveryArea,
        city: deliveryCity,
        state: deliveryState,
        pincode: deliveryPincode,
      },
      items: cart.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variation_id,
        qty: item.qty,
        barcode_id: item.barcode_id ?? null,
      })),
    };

    try {
      setLoading(true);
      const res = await api.post(
        "/admin-dashboard/calling/online-pos-create-order-manual",
        payload,
      );

      if (res.data.success) {
        alert(`✅ Order Created (Manual): ${res.data.data.invoice_number}`);
        printReceipt(res.data.data);
        window.location.reload();
        setCart([]);
      } else {
        alert(res.data.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Manual order error:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create order manually",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

  if (!initiatedPayment?.sale_id) return;

  const interval = setInterval(async () => {

    try {

      const res = await api.post(
        "/admin-dashboard/pos/check-payment-status",
        {
          sale_id: initiatedPayment.sale_id,
        }
      );

      if (
        res.data.success &&
        res.data.data?.status === "complete"
      ) {

        clearInterval(interval);

        const order = res.data.data;

        alert(
          `Payment Confirmed — ${order.invoice_number}`
        );

        printReceipt(order);

        setInitiatedPayment(null);

        resetCartPanel();
      }

    } catch (err) {
      console.log(err);
    }

  }, 5000);

  return () => clearInterval(interval);

}, [initiatedPayment]);

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
            Items: {cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}
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
                    `/admin-dashboard/pos/search-user?phone=${val}`,
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
            onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
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
          <button
            onClick={() => {
              setDraftSearch("");
              setDraftDateFilter("");
              setDraftDateFrom("");
              setDraftDateTo("");
              setDraftStatusFilter("draft");
              setShowAllDrafts(false);
              handleFetchDrafts(1);
            }}
            disabled={draftLoading}
            className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100 disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Draft Orders
          </button>
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
                  <td colSpan="8" className="px-3 py-8 text-center text-slate-500">
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
                    <tr key={i} className="border-t border-slate-100 align-middle">
                      <td className="px-2 py-1">
                        <p className="truncate font-medium text-slate-800">{item.product_name}</p>
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
                          <span className="w-4 text-center text-[10px] font-semibold leading-none">{item.qty}</span>
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
                            setCart((prev) => prev.filter((_, idx) => idx !== i))
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
        {/* Payment Method – always visible for normal (walk-in) customers */}
        <div className="space-y-2 mb-3">
          <label className="text-xs font-semibold text-gray-600">
            Payment Method
          </label>

          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="pay">Payment Link</option>
            <option value="cash">Cash</option>
          </select>
        </div>

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

        {/* ================= TELE-CALLER FLOW: ADDRESS & OTP SECTION ================= */}
        <div className="space-y-3 mb-3 border rounded-lg p-3 bg-blue-50/60">
          <h4 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Delivery Address & OTP Confirmation
          </h4>

          {/* Address fields — always visible */}
          <div className="grid grid-cols-2 gap-2">
            <input
              value={deliveryDoorNo}
              onChange={(e) => setDeliveryDoorNo(e.target.value)}
              placeholder="Door No / House No"
              className="border rounded px-3 py-2 text-xs"
            />
            <input
              value={deliveryStreet}
              onChange={(e) => setDeliveryStreet(e.target.value)}
              placeholder="Street / Road"
              className="border rounded px-3 py-2 text-xs"
            />
            <input
              value={deliveryLandmark}
              onChange={(e) => setDeliveryLandmark(e.target.value)}
              placeholder="Landmark (optional)"
              className="border rounded px-3 py-2 text-xs"
            />
            <input
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              placeholder="Area / Locality"
              className="border rounded px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              placeholder="City (auto-fills from pincode)"
              className="border rounded px-3 py-2 text-xs"
            />
            <input
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              placeholder="State (auto-fills from pincode)"
              className="border rounded px-3 py-2 text-xs"
            />
            <input
              value={deliveryPincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setDeliveryPincode(val);
              }}
              placeholder="Pincode"
              maxLength={6}
              className="border rounded px-3 py-2 text-xs"
            />
          </div>

          {/* Alt Phone */}
          <input
            value={altPhone}
            onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Alt phone no (optional, for payment link)"
            className="w-full border rounded px-3 py-2 text-xs"
          />

          {/* ================= MANUAL CONFIRMATION: Customer Already Paid ================= */}
          <div className="border-t border-blue-200 pt-3 mt-2">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ✅ Customer Already Paid (Manual Confirm)
              </summary>
              <div className="mt-2 space-y-2">
                <p className="text-[10px] text-gray-500">
                  Use this when the customer has paid directly via link, PhonePe, cash, or bank transfer.
                  No OTP or payment link will be sent — order is created immediately.
                </p>
                <select
                  value={manualPaymentMethod}
                  onChange={(e) => setManualPaymentMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-xs"
                >
                  <option value="cash_collected">Cash Collected</option>
                  <option value="direct_link">Direct Payment Link</option>
                  <option value="phonepay">PhonePe Number</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
                <button
                  onClick={handleManualConfirm}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Create Order (Already Paid — ₹{total.toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            </details>
          </div>

          {!otpSent ? (
            /* Send OTP button */
            <button
              onClick={handleSendOtp}
              disabled={otpLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {otpLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send OTP to Customer
                </>
              )}
            </button>
          ) : !otpVerified ? (
            /* OTP sent — show auto-displayed OTP + verify input */
            <div className="space-y-2">
              <p className="text-xs text-blue-700">✅ OTP sent to {customer.phone}</p>
              {otpDisplay && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
                  <p className="text-[10px] text-amber-700">OTP received (tell customer to confirm):</p>
                  <p className="text-xl font-bold tracking-[8px] text-amber-900 font-mono">{otpDisplay}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="flex-1 border rounded px-3 py-2 text-xs text-center tracking-[8px] font-mono"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              {/* Resend OTP with updated details — allows editing cart/address and re-sending */}
              <button
                onClick={handleResendOtp}
                disabled={otpLoading}
                className="w-full border border-orange-300 bg-orange-50 text-orange-700 py-2 rounded-xl text-xs font-semibold hover:bg-orange-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700"></div>
                    Resending OTP...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resend OTP with Updated Details
                  </>
                )}
              </button>
            </div>
          ) : (
            /* OTP Verified — two action buttons */
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold">✅ OTP Verified — Customer Confirmed</p>
              </div>
              <p className="text-[11px] text-green-700">
                Address: {buildAddressString()}, {deliveryCity}, {deliveryState} - {deliveryPincode}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {/* <button
                    onClick={handleSendPaymentLink}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Send Payment Link (Razorpay)
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex-1 bg-amber-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save as Draft
                      </>
                    )}
                  </button> */}
                </div>
                <button
                  onClick={handleSendOrderDetailsLink}
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Send to Order Details
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* <button
          disabled={
            cart.length === 0 ||
            !customer.name ||
            loading
          }
          onClick={() => {
            if (paymentMode === "cash") {
              handleSubmit();
            } else {
              setShowPaymentOptions(true);
            }
          }}
          className="w-full bg-green-700 text-white py-4 rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2 font-semibold"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            `Proceed to Pay ₹ ${total.toFixed(2)}`
          )}
        </button> */}
      </div>

      {/* ── PAYMENT OPTIONS MODAL ── */}
      <PaymentOptionsModal
        open={showPaymentOptions}
        total={total}
        loading={loading}
        onClose={() => setShowPaymentOptions(false)}
        onSelect={async (appKey) => {
          if (!customer.name) {
            alert("Enter customer name");
            return;
          }

          if (cart.length === 0) {
            alert("Cart is empty");
            return;
          }

          const GATEWAY_MAP = {
            phonepe: "phonepe",
            razorpay: "razorpay",
            payu: "payu",
          };

          const gateway = GATEWAY_MAP[appKey] || appKey;

          const payload = {
            customer_id: selectedCustomer?.id || null,
            customer_type: "normal customer",
            address_id: null,
            new_address: null,

            payment_method: appKey,
            gateway: gateway,
            app_key: appKey,

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
            })),
          };

          try {
            setLoading(true);

            const res = await api.post(
              "/admin-dashboard/pos/initiate-payment",
              payload,
            );

            if (res.data.success) {
            const data = res.data.data;

            if (gateway === "phonepe" && data.payment_url) {
              /* Open PhonePe payment page in a new tab so POS state is preserved
                 and the polling mechanism / UPI Collect flow can still operate. */
              window.open(data.payment_url, "_blank", "noopener,noreferrer");
            }

              // setInitiatedPayment({
              //   sale_id: data.sale_id,
              //   invoice_number: data.invoice_number,
              //   gateway: gateway,
              //   app_key: appKey,
              //   payment_link: data.payment_link || null,
              //   payment_url: data.payment_url || null,
              //   payu_action_url: data.payu_action_url || null,
              //   payu_form_data: data.payu_form_data || null,
              //   gateway_response: data.response || data.gateway_response || null,
              // });

              setInitiatedPayment({

          sale_id: data.sale_id,

          invoice_number: data.invoice_number,

          gateway: gateway,

          app_key: appKey,

          payment_link: data.payment_link || null,

          payment_url: data.payment_url || null,

          payu_action_url: data.payu_action_url || null,

          payu_form_data: data.payu_form_data || null,

          gateway_response:
            data.response ||
            data.gateway_response ||
            null,
        });

              setShowPaymentOptions(false);
            } else {
              alert(res.data.message || "Payment initiation failed");
            }
          } catch (err) {
            console.error("Payment initiation error:", err);
            alert(
              err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to initiate payment",
            );
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* ── INITIATED PAYMENT ACTION PANEL ── */}
      {initiatedPayment && (
        <div className="border-t bg-white p-4 space-y-3">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-800">
                  Payment Initiated — {initiatedPayment.gateway === "razorpay" ? "Razorpay" : initiatedPayment.gateway === "phonepe" ? "PhonePe / UPI" : "PayU"}
                </p>
                <p className="text-[11px] text-indigo-600">
                  Invoice: {initiatedPayment.invoice_number}
                </p>
                <p className="text-[11px] font-bold text-indigo-800 mt-0.5">
                  Amount: ₹ {total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* ── UPI COLLECT FLOW (PhonePe) ── */}
            {initiatedPayment.gateway === "phonepe" && (
              <div className="mt-3 space-y-3">
                {/* Customer VPA Input + Send Collect Request */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p className="text-xs font-semibold text-purple-800">UPI Collect Request</p>
                  </div>
                  <p className="text-[11px] text-purple-600 mb-3">
                    Enter the customer's UPI ID to send a payment request. The customer approves in their UPI app.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customerVpa}
                      onChange={(e) => setCustomerVpa(e.target.value.trim())}
                      placeholder="e.g. customer@okaxis"
                      disabled={upiCollectStatus === "sending" || upiCollectStatus === "pending"}
                      className="flex-1 rounded-lg border border-purple-300 bg-white px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:opacity-50"
                    />
                    <button
                      onClick={async () => {
                        if (!customerVpa) {
                          alert("Enter customer UPI ID (VPA)");
                          return;
                        }

                        try {
                          setUpiCollectStatus("sending");
                          setLoading(true);

                          const res = await api.post(
                            "/admin-dashboard/pos/initiate-upi-collect",
                            {
                              sale_id: initiatedPayment.sale_id,
                              invoice_number: initiatedPayment.invoice_number,
                              customer_vpa: customerVpa,
                              amount: total,
                              customer_name: customer.name,
                              customer_phone: customer.phone,
                              note: `INV-${initiatedPayment.invoice_number}`,
                            },
                          );

                          if (res.data.success) {
                            setUpiCollectSaleId(res.data.data?.upi_collect_id || res.data.data?.id);
                            setUpiCollectStatus("pending");
                            alert("Payment request sent! Customer will receive a notification in their UPI app.");
                          } else {
                            setUpiCollectStatus("failed");
                            alert(res.data.message || "UPI collect request failed");
                          }
                        } catch (err) {
                          setUpiCollectStatus("failed");
                          alert(
                            err.response?.data?.message ||
                              err.response?.data?.error ||
                              "Failed to send UPI collect request",
                          );
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={
                        !customerVpa ||
                        upiCollectStatus === "sending" ||
                        upiCollectStatus === "pending"
                      }
                      className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {upiCollectStatus === "sending" ? (
                        <span className="flex items-center gap-1">
                          <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full"></div>
                          Sending…
                        </span>
                      ) : (
                        "Send Request"
                      )}
                    </button>
                  </div>

                  {/* ── Status: Awaiting Approval ── */}
                  {upiCollectStatus === "pending" && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="animate-pulse h-2 w-2 rounded-full bg-amber-500"></div>
                        <p className="text-xs font-semibold text-amber-700">
                          Awaiting Customer Approval
                        </p>
                      </div>
                      <p className="text-[11px] text-amber-600">
                        Payment request of ₹ {total.toFixed(2)} sent to{" "}
                        <span className="font-semibold">{customerVpa}</span>.
                        Ask the customer to check their UPI app and approve.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const res = await api.post(
                              "/admin-dashboard/pos/check-upi-collect-status",
                              {
                                sale_id: initiatedPayment.sale_id,
                                upi_collect_id: upiCollectSaleId,
                              },
                            );

                            if (res.data.success && res.data.data?.status === "complete") {
                              setUpiCollectStatus("approved");
                              const order = res.data.data;
                              alert(`Payment Confirmed — ${order.invoice_number}`);
                              printReceipt(order);
                              setInitiatedPayment(null);
                              resetCartPanel();
                            } else if (res.data.data?.status === "failed") {
                              setUpiCollectStatus("failed");
                              alert("Payment was declined by the customer. Try again.");
                            } else {
                              alert("Payment not yet approved. Waiting for customer action.");
                            }
                          } catch (err) {
                            alert(
                              err.response?.data?.message || "Failed to check payment status",
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="mt-2 w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
                      >
                        Check Status
                      </button>
                      <button
                        onClick={() => {
                          setUpiCollectStatus(null);
                          setCustomerVpa("");
                        }}
                        className="mt-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-600 hover:bg-amber-50 transition"
                      >
                        Cancel & Try Different VPA
                      </button>
                    </div>
                  )}

                  {/* ── Status: Approved ── */}
                  {upiCollectStatus === "approved" && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                      <svg className="h-6 w-6 mx-auto mb-1 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs font-semibold text-emerald-700">Payment Approved!</p>
                    </div>
                  )}

                  {/* ── Status: Failed ── */}
                  {upiCollectStatus === "failed" && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-center">
                      <p className="text-xs font-semibold text-rose-700">Payment Failed / Declined</p>
                      <p className="text-[11px] text-rose-600">Try again with the correct VPA.</p>
                    </div>
                  )}
                </div>

                {/* QR Code fallback (use payment link / URL from initiatedPayment) */}
                {(() => {
                  const qrData = initiatedPayment.payment_link || initiatedPayment.payment_url || "";
                  return qrData ? (
                    <div className="rounded-xl border border-indigo-200 bg-white p-3 text-center">
                      <p className="text-[11px] font-semibold text-slate-500 mb-2">
                        Or Scan QR to Pay ₹ {total.toFixed(2)}
                      </p>
                      <div className="inline-block rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`}
                          alt="Payment QR Code"
                          className="h-[180px] w-[180px]"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<p class="text-xs text-slate-400 p-4">QR code unavailable</p>';
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">
                        Scan with any UPI app if collect request doesn't work
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Razorpay: QR Code + Payment link */}
            {initiatedPayment.gateway === "razorpay" && initiatedPayment.payment_link && (
              <div className="mt-3 space-y-3">
                {/* QR Code */}
                <div className="rounded-xl border border-indigo-200 bg-white p-3 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 mb-2">
                    Scan QR to Pay ₹ {total.toFixed(2)}
                  </p>
                  <div className="inline-block rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(initiatedPayment.payment_link)}`}
                      alt="Payment QR Code"
                      className="h-[180px] w-[180px]"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<p class="text-xs text-slate-400 p-4">QR code unavailable</p>';
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Scan with any UPI app to pay instantly
                  </p>
                </div>
                {/* Payment Link */}
                <div className="rounded-xl border border-indigo-200 bg-white p-3">
                  <p className="text-[11px] font-medium text-slate-500 mb-1">Payment Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={initiatedPayment.payment_link}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(initiatedPayment.payment_link);
                        alert("Payment link copied!");
                      }}
                      className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => window.open(initiatedPayment.payment_link, "_blank")}
                      className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                    >
                      Open
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Share this link with the customer for payment
                  </p>
                </div>
              </div>
            )}

            {/* PayU: Show form */}
            {initiatedPayment.gateway === "payu" && initiatedPayment.payu_action_url && (
              <div className="mt-3 rounded-xl border border-indigo-200 bg-white p-3">
                <p className="text-[11px] font-medium text-slate-500 mb-1">PayU Payment</p>
                <form
                  id="payu-form"
                  action={initiatedPayment.payu_action_url}
                  method="POST"
                  target="_blank"
                >
                  {initiatedPayment.payu_form_data &&
                    Object.entries(initiatedPayment.payu_form_data).map(([key, value]) => (
                      <input key={key} type="hidden" name={key} value={value} />
                    ))}
                </form>
                <button
                  onClick={() => document.getElementById("payu-form")?.submit()}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-md"
                >
                  Proceed to PayU →
                </button>
                <p className="mt-2 text-[11px] text-slate-400">
                  Submits payment form to PayU gateway
                </p>
              </div>
            )}
          </div>

          {/* Payment cancelled/expired status indicator */}
          {initiatedPayment.status === "cancelled" || initiatedPayment.status === "expired" ? (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-bold text-red-700">⚠️ Payment Link {initiatedPayment.status === "cancelled" ? "Cancelled" : "Expired"}</p>
              <p className="text-xs text-red-600">
                Please send a new payment link to the customer.
              </p>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  setLoading(true);

                  // ── FLOW 1: initiatePayment (Sale exists, status via check-payment-status) ──
                  if (initiatedPayment.sale_id) {
                    const res = await api.post("/admin-dashboard/pos/check-payment-status", {
                      sale_id: initiatedPayment.sale_id,
                    });

                    if (res.data.success && res.data.data?.status === "complete") {
                      // Backend already called markSaleAsPaid() via checkRazorpayStatus()
                      const order = res.data.data;
                      alert(`Payment Confirmed — ${order.invoice_number}`);
                      printReceipt(order);
                      setInitiatedPayment(null);
                      resetCartPanel();
                    } else {
                      alert(res.data.message || "Payment not completed yet");
                    }
                    return;
                  }

                  // ── FLOW 2: send-payment-link-only (no Sale yet; PaymentLink id) ──
                  if (initiatedPayment.payment_link_id) {
                    const res = await api.post("/admin-dashboard/pos/check-payment-link-status", {
                      payment_link_id: initiatedPayment.payment_link_id,
                    });

                    if (res.data.success && res.data.data?.status === "complete") {
                      // Step 2: Auto-create order now that payment is confirmed
                      setInitiatedPayment((prev) => ({ ...prev, status: "complete" }));
                      const orderRes = await api.post("/admin-dashboard/pos/create-order-after-payment", {
                        payment_link_id: initiatedPayment.payment_link_id,
                      });
                      if (orderRes.data.success) {
                        const order = orderRes.data.data;
                        alert(`✅ Order Confirmed — ${order.invoice_number}`);
                        printReceipt(order);
                        setInitiatedPayment(null);
                        resetCartPanel();
                      } else {
                        alert(orderRes.data.message || "Payment confirmed but failed to create order");
                      }
                    } else {
                      alert(res.data.message || "Payment not completed yet");
                      // Update status if returned (cancelled/expired)
                      if (res.data.data?.status) {
                        setInitiatedPayment((prev) => ({
                          ...prev,
                          status: res.data.data.status,
                        }));
                      }
                    }
                    return;
                  }

                  // Fallback: no recognised flow
                  alert("Cannot check payment: missing sale_id or payment_link_id");

                } catch (err) {
                  alert(err.response?.data?.message || "Failed to check payment");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
              disabled={loading}
            >
              {loading ? "Checking…" : "Check Payment Status"}
            </button>

            <button
              onClick={() => setInitiatedPayment(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition disabled:opacity-40"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── ADD CUSTOMER POPUP ── */}
      {showAddCustomerPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4">
            <h3 className="text-lg font-semibold text-center">Customer Not Found</h3>

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
                <h3 className="text-xl font-semibold text-slate-900">Purchase History</h3>
                <p className="text-xs text-slate-500">
                  {orderHistory.length} previous order{orderHistory.length === 1 ? "" : "s"}
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
                    <p className="text-base font-semibold text-emerald-700">₹ {order.grand_total}</p>
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
                            <p className="font-medium text-slate-800">{item.product_name}</p>
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600">{item.qty}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-800">₹ {item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {orderHistory.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No purchase history found</p>
                <p className="mt-1 text-xs text-slate-500">Completed orders will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- DRAFT ORDERS MODAL -- */}
      {showDraftOrders && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/55 p-4 pt-8">
          <div className="max-h-[88vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            {/* ── HEADER ── */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Draft Orders</h3>
                <p className="text-xs text-slate-500">
                  {draftPagination.total} draft order
                  {draftPagination.total === 1 ? "" : "s"} found
                </p>
              </div>
              <button
                onClick={() => setShowDraftOrders(false)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 transition hover:bg-slate-200"
              >
                X
              </button>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[180px] flex-1">
                <input
                  type="text"
                  placeholder="Search by phone or name..."
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-9 text-xs placeholder-slate-400 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>

              {/* Date filter buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {["today", "yesterday", "custom"].map((key) => (
                  <button
                    key={key}
                    onClick={() =>
                      setDraftDateFilter(draftDateFilter === key ? "" : key)
                    }
                    className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
                      draftDateFilter === key
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>

              {/* Custom date range pickers */}
              {draftDateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draftDateFrom}
                    onChange={(e) => setDraftDateFrom(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span className="text-[11px] text-slate-500">to</span>
                  <input
                    type="date"
                    value={draftDateTo}
                    onChange={(e) => setDraftDateTo(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              )}

              {/* My Drafts / All Drafts toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  onClick={() => {
                    setShowAllDrafts(false);
                    handleFetchDrafts(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
                    !showAllDrafts
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  My Drafts
                </button>
                <button
                  onClick={() => {
                    setShowAllDrafts(true);
                    handleFetchDrafts(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
                    showAllDrafts
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Drafts
                </button>
              </div>

              {/* Status filter */}
              <select
                value={draftStatusFilter}
                onChange={(e) => setDraftStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="draft">Draft</option>
                <option value="converted">Converted</option>
                <option value="all">All</option>
              </select>

              {/* Search / Apply button */}
              <button
                onClick={() => handleFetchDrafts(1)}
                disabled={draftLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {draftLoading ? "Loading..." : "Search"}
              </button>
            </div>

            {/* ── DRAFT LIST ── */}
            {draftOrders.length > 0 ? (
              <div className="space-y-3">
                {draftOrders.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {draft.customer_name || "Unknown"}
                          </p>
                          <span className="text-xs text-slate-500">
                            Phone: {draft.customer_phone}
                          </span>
                          {draft.alt_phone && (
                            <span className="text-xs text-slate-400">
                              Alt: {draft.alt_phone}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{draft.created_at}</span>
                          <span>
                            {draft.item_count} item
                            {draft.item_count === 1 ? "" : "s"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              draft.status === "converted"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {draft.status}
                          </span>
                          {draft.added_by_name && (
                            <span className="text-[10px] text-slate-400 italic">
                              by {draft.added_by_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">
                          Grand Total
                        </p>
                        <p className="text-base font-semibold text-emerald-700">
                          Rs {draft.grand_total}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
                      <button
                        onClick={() => handleLoadDraft(draft.id)}
                        disabled={draftLoading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
                      >
                        Modify
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              "Send order details link to " +
                                draft.customer_phone +
                                "?",
                            )
                          )
                            return;
                          try {
                            setDraftSendDetailsLoading(true);
                            const res = await api.post(
                              "/admin-dashboard/pos/send-order-details-link-draft",
                              { draft_id: draft.id },
                            );
                            if (res.data.success) {
                              alert(
                                "✅ Order details link sent to " +
                                  draft.customer_phone,
                              );
                              handleFetchDrafts(draftPage);
                            } else {
                              alert(
                                res.data.message ||
                                  "Failed to send order details link",
                              );
                            }
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Failed to send order details link",
                            );
                          } finally {
                            setDraftSendDetailsLoading(false);
                          }
                        }}
                        disabled={draftSendDetailsLoading}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-40"
                      >
                        {draftSendDetailsLoading ? "Sending..." : "Send Details Again"}
                      </button>
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              "Send payment link to " +
                                draft.customer_phone +
                                "?",
                            )
                          )
                            return;
                          try {
                            setDraftLoading(true);
                            const res = await api.post(
                              "/admin-dashboard/pos/send-payment-link-draft",
                              { draft_id: draft.id },
                            );
                            if (res.data.success) {
                              alert("Payment link sent successfully!");
                              handleFetchDrafts(draftPage); // re-fetch to refresh
                            } else {
                              alert(
                                res.data.message ||
                                  "Failed to send payment link",
                              );
                            }
                          } catch (err) {
                            alert(
                              err.response?.data?.message ||
                                "Failed to send payment link",
                            );
                          } finally {
                            setDraftLoading(false);
                          }
                        }}
                        disabled={draftLoading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition disabled:opacity-40"
                      >
                        {draftLoading ? "Sending..." : "Send Payment Link"}
                      </button>
                      <button
                        onClick={() => handleCancelDraft(draft.id)}
                        disabled={draftCancelLoading}
                        className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-40"
                      >
                        {draftCancelLoading ? "Cancelling..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No draft orders
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search or filter criteria.
                </p>
              </div>
            )}

            {/* ── PAGINATION FOOTER ── */}
            {draftPagination.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">
                  Page {draftPagination.current_page} of{" "}
                  {draftPagination.last_page} ({draftPagination.total} total)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleFetchDrafts(draftPagination.current_page - 1)
                    }
                    disabled={
                      draftLoading || draftPagination.current_page <= 1
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from(
                    { length: draftPagination.last_page },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === draftPagination.last_page ||
                        Math.abs(p - draftPagination.current_page) <= 1,
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-xs text-slate-400">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => handleFetchDrafts(p)}
                          disabled={draftLoading}
                          className={`min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                            p === draftPagination.current_page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          } disabled:opacity-40`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() =>
                      handleFetchDrafts(draftPagination.current_page + 1)
                    }
                    disabled={
                      draftLoading ||
                      draftPagination.current_page >= draftPagination.last_page
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
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

  let customer = order.shipping_address_snapshot || {};

  const customerName = customer.name || "Walk-in Customer";
  const customerPhone = customer.phone || "-";

  const address = [
    customer.address,
    customer.city,
    customer.state,
    customer.pincode,
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
<td class="right">₹${order.subtotal}</td>
</tr>

<tr>
<td>Subtotal</td>
<td class="right">₹${order.subtotal}</td>
</tr>

<tr>
<td>Product Discount  </td>
<td class="right">₹${order.discount_total ?? 0}</td>
</tr>

<tr>
<td>Bill Discount</td>
<td class="right">₹${order.billed_discount ?? 0}</td>
</tr>

<tr>
<td>GST</td>
<td class="right">₹${order.tax_total ?? 0}</td>
</tr>

<tr>
<td>Delivery Fee (+)</td>
<td class="right">₹${Number(order.delivery_charge ?? 0).toFixed(2)}</td>
</tr>

<tr class="total">
<td><b>Total</b></td>
<td class="right"><b>₹${order.grand_total}</b></td>
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