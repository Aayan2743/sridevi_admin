export default function InvoiceA4({ order }) {
  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto p-8 text-black bg-white print:block">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">YOUR STORE NAME</h1>
          <p className="text-sm">Address Line 1</p>
          <p className="text-sm">GSTIN: XXXXXXXXXX</p>
        </div>

        <div className="text-right text-sm">
          <p>
            <b>Invoice:</b> {order.order_no}
          </p>
          <p>
            <b>Date:</b> {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="mb-6 text-sm">
        <p>
          <b>Customer:</b> {order.customer.name}
        </p>
        <p>
          <b>Mobile:</b> {order.customer.phone}
        </p>
      </div>

      {/* TABLE */}
      <table className="w-full border border-black text-sm">
        <thead className="border-b border-black">
          <tr>
            <th className="border-r border-black p-2">#</th>
            <th className="border-r border-black p-2 text-left">Item</th>
            <th className="border-r border-black p-2">Qty</th>
            <th className="border-r border-black p-2">Rate</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-black">
              <td className="border-r border-black p-2 text-center">{i + 1}</td>
              <td className="border-r border-black p-2">
                {item.product_name} ({item.variation_name})
              </td>
              <td className="border-r border-black p-2 text-center">
                {item.qty}
              </td>
              <td className="border-r border-black p-2 text-right">
                {item.price}
              </td>
              <td className="p-2 text-right">
                {(item.qty * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="flex justify-end mt-6">
        <div className="w-1/3 space-y-1 text-sm">
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

          <div className="flex justify-between font-bold text-base border-t border-black pt-2">
            <span>Total</span>
            <span>{order.total}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-xs mt-10">
        This is a computer generated invoice
      </div>
    </div>
  );
}
