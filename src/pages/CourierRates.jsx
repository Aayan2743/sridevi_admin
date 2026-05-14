import { useState } from "react";

export default function CourierRates({ rates }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-black text-white">
          <tr>
            <th className="px-4 py-3 text-left">Courier Partner</th>
            <th className="px-4 py-3 text-left">Estimated Delivery</th>
            <th className="px-4 py-3 text-left">Chargeable Weight</th>
            <th className="px-4 py-3 text-left">Charges</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {rates.map((courier) => (
            <tr key={courier.id} className="border-b hover:bg-gray-50">

              {/* Courier Partner */}
              <td className="px-4 py-4 flex items-center gap-3">
                <img
                  src={courier.image}
                  alt={courier.name}
                  className="w-10 h-10 object-contain"
                />

                <div>
                  <div className="font-semibold text-gray-800">
                    {courier.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    Domestic (Surface)
                  </div>
                </div>
              </td>

              {/* Estimated Delivery */}
              <td className="px-4 py-4 text-gray-700">
                {courier.estimated_delivery || "--"}
              </td>

              {/* Weight */}
              <td className="px-4 py-4">
                {courier.minimum_chargeable_weight}
              </td>

              {/* Charges */}
              <td className="px-4 py-4 font-semibold text-gray-900">
                ₹ {courier.total_charges.toFixed(2)}
              </td>

              {/* Action */}
              <td className="px-4 py-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"
                >
                  Ship Now
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}