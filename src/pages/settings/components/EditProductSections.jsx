import { useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import api from "../../../api/axios";

export default function EditProductSections({ productId }) {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH SECTIONS ================= */
  const fetchSections = async () => {
    try {
      const res = await api.get("/admin-dashboard/sections");
      setSections(res.data.data || []);
    } catch {
      toast.error("Failed to load sections");
    }
  };

  /* ================= FETCH ASSIGNED ================= */
  const fetchAssigned = async () => {
    try {
      const res = await api.get(`/admin-dashboard/products/${productId}`);

      const assigned = res.data?.data?.sections?.map((s) => s.id) || [];

      setSelected(assigned);
    } catch {
      console.log("Failed to load assigned sections");
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchSections();
    fetchAssigned();
  }, [productId]);

  /* ================= TOGGLE ================= */
  const toggleSection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      await api.post(`/admin-dashboard/products/${productId}/assign-sections`, {
        sections: selected,
      });

      toast.success("Sections updated");
    } catch {
      toast.error("Failed to update sections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Product Sections</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            onClick={() => toggleSection(section.id)}
            className={`border rounded-lg p-4 cursor-pointer transition
              ${
                selected.includes(section.id)
                  ? "border-indigo-600 bg-indigo-50"
                  : "hover:border-indigo-300"
              }
            `}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{section.name}</span>

              <input
                type="checkbox"
                checked={selected.includes(section.id)}
                readOnly
              />
            </div>

            <p className="text-xs text-gray-400 mt-1">{section.slug}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Saving..." : "Save Sections"}
        </button>
      </div>
    </div>
  );
}
