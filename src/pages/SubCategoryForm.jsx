import { useState } from "react";
import api from "../api/axios";

export default function SubCategoryForm({ category, onClose, onSaved }) {
  const [subCategories, setSubCategories] = useState([""]);
  const [loading, setLoading] = useState(false);

  /* ADD FIELD */
  const addField = () => {
    setSubCategories([...subCategories, ""]);
  };

  /* REMOVE FIELD */
  const removeField = (index) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  /* CHANGE */
  const handleChange = (index, value) => {
    const updated = [...subCategories];
    updated[index] = value;
    setSubCategories(updated);
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    const clean = subCategories.filter((v) => v.trim() !== "");
    if (!clean.length) return alert("Enter at least one sub category");

    try {
      setLoading(true);

      await api.post("/admin-dashboard/add-sub-category", {
        parent_id: category.id,
        subcategories: clean,
      });

      onSaved();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add sub categories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Add Sub Categories
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="text-sm text-gray-500">
          Parent: <b>{category.name}</b>
        </div>

        {subCategories.map((value, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="Sub category name"
              className="border rounded-lg px-3 py-2 flex-1"
            />
            {subCategories.length > 1 && (
              <button
                onClick={() => removeField(i)}
                className="text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addField}
          className="text-indigo-600 text-sm font-medium"
        >
          + Add More
        </button>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}
