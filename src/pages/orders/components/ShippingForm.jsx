export default function ShippingForm() {
  return (
    <section className="border rounded-xl p-4 space-y-3">
      <h4 className="font-medium">Shipping Details</h4>

      <input
        className="input"
        placeholder="Courier Provider (Shiprocket)"
      />

      <input
        className="input"
        placeholder="Tracking Number"
      />

      <input
        className="input"
        placeholder="Tracking Link"
      />

      <button className="w-full bg-purple-600 text-white py-2 rounded-lg">
        Save & Mark Shipped
      </button>
    </section>
  );
}
