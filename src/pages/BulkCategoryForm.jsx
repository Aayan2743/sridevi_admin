import { useState } from "react";
import api from "../api/axios";

export default function BulkCategoryForm({ onClose, onSaved }) {
  const [rows, setRows] = useState([{ name: "" }]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    const updated = [...rows];
    updated[index].name = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { name: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.name.trim() !== "");

    if (!validRows.length) {
      alert("Please enter at least one category");
      return;
    }

    try {
      setLoading(true);

      for (let row of validRows) {
        await api.post("/admin-dashboard/add-category", {
          name: row.name,
        });
      }

      onSaved();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || "Bulk save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Bulk Add Categories</h2>

        <div className="space-y-3 max-h-64 overflow-auto">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={row.name}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`Category ${index + 1}`}
                className="border px-3 py-2 rounded-lg w-full"
              />
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addRow} className="text-indigo-600 text-sm">
          + Add More
        </button>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </div>
  );
}
