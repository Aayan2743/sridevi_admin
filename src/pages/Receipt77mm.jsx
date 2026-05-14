export default function Receipt77mm({ order }) {
  return (
    <div className="w-[77mm] mx-auto text-[12px] font-mono text-black print:block">
      {/* STORE */}
      <div className="text-center mb-2">
        <p className="font-bold text-sm">YOUR STORE NAME</p>
        <p>GSTIN: XXXXXXXXXX</p>
        <p>Phone: 9XXXXXXXXX</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* ORDER INFO */}
      <div className="space-y-0.5">
        <p>Order: {order.order_no}</p>
        <p>Date: {new Date().toLocaleString()}</p>
        <p>Customer: {order.customer.name}</p>
        <p>Mobile: {order.customer.phone}</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* ITEMS */}
      <div className="space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="font-semibold">
              {item.product_name} ({item.variation_name})
            </p>
            <div className="flex justify-between">
              <span>
                {item.qty} x {item.price}
              </span>
              <span>{(item.qty * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* TOTALS */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{order.subtotal}</span>
        </div>

        {order.gst.enabled && (
          <div className="flex justify-between">
            <span>GST ({order.gst.percent}%)</span>
            <span>{order.gst.amount}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-sm">
          <span>Total</span>
          <span>{order.total}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <p className="text-center mt-2">Thank You! Visit Again 🙏</p>
    </div>
  );
}
