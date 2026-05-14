export default function OrderProducts({ items = [] }) {
  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        Ordered Products
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 border rounded-lg p-3"
          >
            {/* IMAGE */}
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">
                  No Image
                </span>
              )}
            </div>

            {/* DETAILS */}
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>

              {item.variant && (
                <p className="text-xs text-gray-500">
                  {item.variant}
                </p>
              )}

              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-500">
                  ₹{item.price} × {item.qty}
                </span>
                <span className="font-semibold">
                  ₹{item.price * item.qty}
                </span>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}
