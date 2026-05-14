import { useState } from "react";

export default function RateCardForm({
  categories,
  data,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    id: data?.id || null,
    category_id: data?.category_id || "",
    caratwt: data?.caratwt || "",
    rate: data?.rate || "",
    weight: data?.weight || "",
    extension: data?.extension || "p/pc",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow">
        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-3 border-b">
          <h2 className="font-semibold">
            {form.id ? "Edit Rate Card" : "Add Rate Card"}
          </h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* CATEGORY */}
          <div>
            <label className="text-sm">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* CARAT WT */}
          <div>
            <label className="text-sm">Carat Wt</label>
            <input
              name="caratwt"
              value={form.caratwt}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="0.01 - 0.28"
              required
            />
          </div>

          {/* RATE */}
          <div>
            <label className="text-sm">Rate (₹)</label>
            <input
              type="number"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* WEIGHT */}
          <div>
            <label className="text-sm">Weight</label>
            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* EXTENSION */}
          <div>
            <label className="text-sm">Extension</label>
            <select
              name="extension"
              value={form.extension}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="p/pc">p/pc</option>
              <option value="p/ct">p/ct</option>
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
