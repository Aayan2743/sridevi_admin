import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  showLoader,
  closeLoader,
  showErrorToast,
  showSuccessToast,
} from "../../../utils/swal";

// import { showLoader, closeLoader, showErrorToast } from "../utils/swal";

export default function ProductSectionAssign({ product, sections, onSaved }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;

    // 🔥 SET SELECTED FROM PRODUCT
    const assigned = product.sections?.map((s) => s.id) || [];
    setSelected(assigned);
  }, [product]);

  const toggleSection = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // const handleSave = async () => {
  //   try {
  //     setLoading(true);

  //     await api.post(`/admin-dashboard/products/${product.id}/sections`, {
  //       sections: selected,
  //     });

  //     // 🔥 UPDATE UI INSTANTLY
  //     const updatedSections = sections.filter((s) => selected.includes(s.id));

  //     onSaved?.(updatedSections);
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to update sections");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSave = async () => {
    try {
      setLoading(true);

      showLoader("Saving Sections..."); // ⏳ LOADER

      await api.post(`/admin-dashboard/products/${product.id}/sections`, {
        sections: selected,
      });

      // 🔥 UPDATE UI INSTANTLY
      const updatedSections = sections.filter((s) => selected.includes(s.id));

      closeLoader(); // ❎ CLOSE LOADER
      showSuccessToast("Sections updated successfully"); // ✅ SUCCESS

      onSaved?.(updatedSections);
    } catch (error) {
      console.error(error);

      closeLoader(); // ❎ CLOSE LOADER
      showErrorToast("Failed to update sections"); // ❌ ERROR
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          onClick={() => toggleSection(section.id)}
          className={`border rounded-lg p-4 cursor-pointer transition
            ${
              selected.includes(section.id)
                ? "bg-indigo-50 border-indigo-600"
                : "hover:border-indigo-300"
            }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{section.name}</span>

            <input
              type="checkbox"
              checked={selected.includes(section.id)}
              onChange={() => toggleSection(section.id)}
              onClick={(e) => e.stopPropagation()} // 🔥 FIX DOUBLE CLICK
            />
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
      >
        {loading ? "Saving..." : "Save Sections"}
      </button>
    </div>
  );
}
