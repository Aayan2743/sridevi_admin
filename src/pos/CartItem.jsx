export default function CartItem({ item }) {
  return (
    <div className="border rounded-lg p-3">
      <p className="font-medium">{item.name}</p>
      <p className="text-xs text-gray-500">
        {Object.values(item.selected).join(" • ")}
      </p>

      <div className="flex justify-between mt-2">
        <span>₹ {item.price}</span>
        <span>Qty: {item.qty}</span>
      </div>
    </div>
  );
}
