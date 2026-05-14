const COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${COLORS[status]}`}
    >
      {status}
    </span>
  );
}
