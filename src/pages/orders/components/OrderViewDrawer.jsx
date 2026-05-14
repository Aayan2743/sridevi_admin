// src/pages/orders/components/OrderViewDrawer.jsx

import { useState } from "react";
import OrderTimeline from "./OrderTimeline";
import ShippingDetails from "./ShippingDetails";
import OrderProducts from "./OrderProducts";

export default function OrderViewDrawer({ order, onClose }) {
  const [status, setStatus] = useState(order.status);

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[35%] bg-gray-50 z-50 flex flex-col shadow-xl">
        
        {/* HEADER */}
        <div className="bg-white px-5 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Order #{order.order_no || order.id}
            </h2>
            <p className="text-xs text-gray-500">
              {order.date || "—"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-sm">

          {/* STATUS */}
          <Card>
            <OrderTimeline
              status={status}
              onChange={(newStatus) => {
                setStatus(newStatus);

                // 🔗 BACKEND API CALL HERE
                // updateOrderStatus(order.id, newStatus);
              }}
            />
          </Card>

          {/* SHIPPING – ONLY WHEN SHIPPED */}
          {status === "Shipped" && (
            <ShippingDetails
              order={order}
              onSave={(shipping) => {
                console.log("Shipping details:", shipping);

                // 🔗 API CALL HERE
                // saveShipping(order.id, shipping);
              }}
            />
          )}

          {/* CUSTOMER */}
          <Card>
            <SectionTitle title="Customer" />
            <InfoRow label="Name" value={order.customer} />
            <InfoRow label="Mobile" value={order.mobile} />
          </Card>
          
          <OrderProducts items={order.items} />


          {/* PAYMENT */}
          <Card>
            <SectionTitle title="Payment" />
            <InfoRow label="Method" value={order.payment} />

            <div className="flex justify-between items-center pt-3 mt-3 border-t">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-lg font-semibold">
                ₹{order.amount}
              </span>
            </div>
          </Card>

          {/* ACTIONS */}
          <div className="space-y-2">
            <button className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= UI HELPERS ================= */

function Card({ children }) {
  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">
      {children}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="text-xs font-semibold text-gray-500 uppercase">
      {title}
    </h3>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
