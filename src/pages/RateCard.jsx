import { useState } from "react";
import RateCardForm from "./RateCardForm";

/* ===== CATEGORY MASTER ===== */
const categories = [
  { id: 1, name: "Diamond Jewellery" },
  { id: 2, name: "Solitaire Diamond Jewellery" },
  { id: 3, name: "Diamond Grading" },
  { id: 4, name: "Solitaire Diamond Grading" },
  { id: 5, name: "sdfsdf" },
];

/* ===== SAMPLE DATA ===== */
const initialRates = [
  {
    id: 1,
    category_id: 1,
    caratwt: "0.01 - 0.28",
    rate: 100,
    weight: "0.28",
    extension: "p/pc",
  },
  {
    id: 2,
    category_id: 1,
    caratwt: "0.29 - Above",
    rate: 400,
    weight: "",
    extension: "p/pc",
  },
  {
    id: 3,
    category_id: 2,
    caratwt: "0.20 - 0.99",
    rate: 450,
    weight: "",
    extension: "p/pc",
  },
];

export default function RateCard() {
  const [rateCards, setRateCards] = useState(initialRates);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleAdd = (categoryId) => {
    setEditData({ category_id: categoryId });
    setOpenForm(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setOpenForm(true);
  };

  const handleSave = (formData) => {
    if (formData.id) {
      // UPDATE
      setRateCards((prev) =>
        prev.map((r) => (r.id === formData.id ? formData : r))
      );
    } else {
      // ADD
      setRateCards((prev) => [
        ...prev,
        { ...formData, id: Date.now() },
      ]);
    }
    setOpenForm(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Rate Card</h1>

      {categories.map((category) => (
        <div key={category.id} className="bg-white shadow rounded">
          {/* CATEGORY HEADER */}
          <div className="flex justify-between items-center bg-[#b08a5a] text-white px-4 py-2">
            <span className="font-semibold">{category.name}</span>
            <button
              onClick={() => handleAdd(category.id)}
              className="bg-white text-[#b08a5a] px-3 py-1 rounded text-sm font-medium"
            >
              ➕ Add
            </button>
          </div>

          {/* TABLE */}
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Carat Wt</th>
                <th className="p-3 text-left">Rate (₹)</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {rateCards.filter(
                (r) => r.category_id === category.id
              ).length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    No data
                  </td>
                </tr>
              ) : (
                rateCards
                  .filter((r) => r.category_id === category.id)
                  .map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-3">{row.caratwt}</td>
                      <td className="p-3">{row.rate}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* ADD / EDIT FORM */}
      {openForm && (
        <RateCardForm
          categories={categories}
          data={editData}
          onClose={() => setOpenForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
