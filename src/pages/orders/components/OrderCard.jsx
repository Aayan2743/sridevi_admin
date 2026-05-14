import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard({ order, onView }) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between">
        <h3 className="font-semibold">{order.id}</h3>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="text-sm text-gray-600">
        <p className="font-medium">{order.customer.name}</p>
        <p>{order.customer.mobile}</p>
      </div>

      <div className="flex justify-between items-center">
        <span className="font-semibold">₹ {order.total}</span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {order.payment_mode}
        </span>
      </div>

      <button
        onClick={onView}
        className="w-full border py-2 rounded-lg text-sm"
      >
        View Order
      </button>
    </div>
  );
}
