import React from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
export default function ShippingProviderModal({ open, onClose, onSelect }) {
  if (!open) return null;

  const handleShippingProvider = async (provider) => {
    try {
      const response = await api.post(
        `/orders/${selectedOrder.id}/ship/${provider}`,
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Shipment created successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        console.log(response.data.data);

        loadOrders();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Shipment creation failed",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Select Shipping Provider</h3>

        <div className="space-y-2">
          <button
            onClick={() => onSelect("shiprocket")}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Shiprocket
          </button>

          <button
            onClick={() => onSelect("shipmozo")}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Shipmozo
          </button>

          <button
            onClick={() => onSelect("xpressbees")}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Xpressbees
          </button>

          <button
            onClick={() => onSelect("local")}
            className="w-full bg-orange-600 text-white py-2 rounded"
          >
            Local
          </button>
        </div>

        <button onClick={onClose} className="mt-4 w-full border py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
