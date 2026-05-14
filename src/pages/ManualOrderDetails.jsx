import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ManualOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin-dashboard/calling/order/${id}`);

      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await api.post(
        `/admin-dashboard/order/update-status/${order.id}`,
        { status },
      );

      if (res.data.success) {
        // ✅ update UI instantly
        setOrder((prev) => ({
          ...prev,
          status: status,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6">No Order Found</p>;

  const customer = order.shipping_address_snapshot;

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      created: "bg-yellow-100 text-yellow-600",
      shipped: "bg-blue-100 text-blue-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const printReceipt = (order) => {
    console.log("PRINTING RECEIPT FOR ORDER:", order);

    const dateTime = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : new Date().toLocaleString();

    const customer = order.shipping_address_snapshot || {};

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
          item.product_name.length > 20
            ? item.product_name.substring(0, 20) + ".."
            : item.product_name;

        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const discount = Number(item.discount || 0);

        const mrp = price;
        const finalPrice = price - discount;

        const lineMRP = mrp * qty;
        const lineDiscount = discount * qty;
        const lineAmount = finalPrice * qty;

        return `
<tr>
  <td class="item">${name}</td>
  <td class="right qty">${qty}</td>
  <td class="right mrp">₹${lineMRP.toFixed(2)}</td>
  <td class="right disc">₹${lineDiscount.toFixed(2)}</td>
  <td class="right amt">₹${lineAmount.toFixed(2)}</td>
</tr>
`;
      })
      .join("");

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

    doc.write(`
<html>
<head>

<style>

body{
  font-family: monospace;
  width:72mm;
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
}

.item{
  width:42%;
  overflow:hidden;
  text-overflow:ellipsis;
}

.qty{ width:5%; }
.mrp{ width:20%; }
.disc{ width:20%; }
.amt{ width:20%; }

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
  <td class="right">₹${Number(order.subtotal).toFixed(2)}</td>
</tr>

<tr>
  <td>Product Discount (-)</td>
  <td class="right">₹${Number(order.discount_total || 0).toFixed(2)}</td>
</tr>

<tr>
  <td>Bill Discount (-)</td>
  <td class="right">₹${Number(order.billed_discount || 0).toFixed(2)}</td>
</tr>



<tr>
  <td>Delivery Charges (+)</td>
  <td class="right">₹${Number(order.delivery_charge || 0).toFixed(2)}</td>
</tr>

<tr>
  <td>GST (+)</td>
  <td class="right">₹${Number(order.tax_total || 0).toFixed(2)}</td>
</tr>

<tr class="total">
  <td>Total</td>
  <td class="right">₹${Number(order.paid_amount).toFixed(2)}</td>
</tr>

</table>

<hr>

<div class="footer">
Powered by Sri Devi Herbals POS
</div>

</body>
</html>
`);

    doc.close();

    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };

  return (
    <>
      <style>{`
      @media print {

        body {
          width: 80mm;
          margin:0;
          font-family: monospace;
        }

        .print-container{
          width:76mm;
          margin:auto;
          font-family: monospace;
          font-size:11px;
          line-height:1.5;
        }

        .no-print{
          display:none !important;
        }

        .print-header{
          text-align:center;
          border-bottom:1px dashed #000;
          padding-bottom:6px;
          margin-bottom:6px;
        }

        .print-title{
          font-size:15px;
          font-weight:bold;
        }

        .print-sub{
          font-size:10px;
        }

        .print-section{
          border-bottom:1px dashed #000;
          padding:6px 0;
          margin-bottom:6px;
        }

        .print-row{
          display:flex;
          justify-content:space-between;
          font-size:11px;
        }

        .print-label{
          font-weight:bold;
        }

        .print-table{
          width:100%;
          border-collapse:collapse;
          margin-top:6px;
          font-size:10px;
        }

        .print-table th{
          border-bottom:1px solid #000;
          text-align:left;
          padding:3px 2px;
        }

        .print-table td{
          padding:3px 2px;
          vertical-align:top;
          word-break:break-word;
        }

        .item-name{
          width:40%;
        }

        .item-qty{
          width:12%;
          text-align:center;
        }

        .item-price{
          width:20%;
          text-align:right;
        }

        .item-total{
          width:28%;
          text-align:right;
        }

        .print-total{
          font-size:13px;
          font-weight:bold;
        }

        .print-footer{
          text-align:center;
          font-size:10px;
          margin-top:8px;
        }

      }
      `}</style>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center no-print">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{order.invoice_number}</h2>

            {/* STATUS BADGE (always visible) */}
            {getStatusBadge(order.status)}

            {/* DROPDOWN ONLY FOR ON-CALL / WHATSAPP */}
            {["on-call", "whatsapp"].includes(
              (order.order_from || "").toLowerCase(),
            ) && (
              <div className="mt-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="border px-3 py-1 rounded text-sm"
                >
                  <option value="created">Created</option>
                  <option value="picked">Picked</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* PRINT RECEIPT */}

        {/* Customer Card */}
        <div className="bg-white shadow rounded p-6 no-print">
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{customer?.name}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{customer?.phone}</p>
            </div>

            <div className="col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="font-medium">
                {customer?.address}, {customer?.city}, {customer?.state} -{" "}
                {customer?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white shadow rounded overflow-hidden no-print">
          <h3 className="text-lg font-semibold p-6">Order Items </h3>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Variant</th>
                <th className="p-3">MRP</th>
                {/* <th className="p-3">Price</th> */}
                <th className="p-3">Qty</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span>{item.product_name}</span>
                  </td>

                  <td className="p-3">{item.variant_name}</td>
                  <td className="p-3">₹ {item.price}</td>

                  {/* <td className="p-3">
                      ₹ {(Number(item.price) - Number(item.discount)).toFixed(2)}
                    </td> */}

                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">₹ {item.discount}</td>
                  <td className="p-3 font-semibold">₹ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="bg-white shadow rounded p-6 max-w-md ml-auto no-print">
          <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ {order.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount (-)</span>
              <span>₹ {order.discount_total}</span>
            </div>

            <div className="flex justify-between">
              <span>Bill Discount (-)</span>
              <span>₹ {order.billed_discount}</span>
            </div>

            <div className="flex justify-between">
              <span>GST (+)</span>
              <span>₹ {order.tax_total}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total</span>
              <span>
                ₹ {Number(order.grand_total) + Number(order.tax_total)}{" "}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Paid</span>
              <span>₹ {order.paid_amount}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹ {order.delivery_charge}</span>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="text-right no-print">
          <button
            onClick={() => printReceipt(order)}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </>
  );
}
