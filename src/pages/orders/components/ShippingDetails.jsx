import { useState } from "react";

export default function ShippingDetails({ order, onSave }) {
  const [provider, setProvider] = useState(order.shipping?.provider || "");
  const [trackingNo, setTrackingNo] = useState(order.shipping?.trackingNo || "");
  const [trackingUrl, setTrackingUrl] = useState(order.shipping?.trackingUrl || "");

  return (
    <div className="bg-white rounded-xl border p-4 space-y-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        Shipping Details
      </h3>

      {/* PROVIDER */}
      <div>
        <label className="text-xs text-gray-600">Shipping Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select provider</option>
          <option>Delhivery</option>
          <option>Shiprocket</option>
          <option>Blue Dart</option>
          <option>DTDC</option>
          <option>India Post</option>
        </select>
      </div>

      {/* TRACKING NUMBER */}
      <div>
        <label className="text-xs text-gray-600">Tracking Number</label>
        <input
          value={trackingNo}
          onChange={(e) => setTrackingNo(e.target.value)}
          placeholder="Enter tracking number"
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* TRACKING URL */}
      <div>
        <label className="text-xs text-gray-600">Tracking URL</label>
        <input
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://tracking-link"
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* ACTION */}
      <button
        onClick={() =>
          onSave({
            provider,
            trackingNo,
            trackingUrl,
          })
        }
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
      >
        Save Shipping Details
      </button>
    </div>
  );
}
