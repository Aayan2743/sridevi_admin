import { useState } from "react";
import api from "../api/axios";
export default function BulkAddVariation({ variationId, onClose, reload }) {
  const [values, setValues] = useState([""]);
  const [loading, setLoading] = useState(false);

  const addMore = () => {
    setValues([...values, ""]);
  };

  const updateValue = (index, value) => {
    const updated = [...values];
    updated[index] = value;
    setValues(updated);
  };

  const removeValue = (index) => {
    setValues(values.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      for (const value of values) {
        if (!value.trim()) continue;

        await api.post(`/admin-dashboard/add-variation-value/${variationId}`, {
          value: value,
        });
      }

      alert("Values added successfully");
      reload();
      onClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        alert(err.response.data.errors);
      } else {
        alert("Failed to save");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[500px] rounded-xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Bulk Add Values</h2>

        {values.map((val, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={val}
              onChange={(e) => updateValue(index, e.target.value)}
              placeholder={`Value ${index + 1}`}
              className="input flex-1"
            />

            {values.length > 1 && (
              <button
                onClick={() => removeValue(index)}
                className="text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addMore}
          className="text-indigo-600 text-sm"
        >
          + Add More
        </button>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </div>
  );
}