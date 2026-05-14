import { useState } from "react";

export default function VariationModal({ product, onClose, onAdd }) {
  const [selected, setSelected] = useState({});

  // const handleAdd = () => {
  //   onAdd({
  //     ...product,
  //     selected,
  //     qty: 1,
  //   });
  // };

const handleAdd = () => {
  if (!selected) return;

  onAdd({
    product_id: product.id,
    product_name: product.name,

    variation_id: selected.id,
    variation_name: selected.name,

    // ✅ FIX HERE
    price: Number(selected.price) || 0,
    mrp: Number(selected.MRP) || 0,
    discount: Number(selected.discount) || 0,

    qty: 1,
    stock: Number(selected.stock) || 0,

    tax: product.tax,
  });
};
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {product.name}
        </h3>

        {Object.entries(product.variations).map(([key, values]) => (
          <div key={key} className="mb-4">
            <p className="text-sm font-medium mb-2">
              Choose {key}
            </p>
            <div className="flex gap-2 flex-wrap">
              {values.map((v) => (
                <button
                  key={v}
                  onClick={() =>
                    setSelected({ ...selected, [key]: v })
                  }
                  className={`px-3 py-1 rounded border ${
                    selected[key] === v
                      ? "bg-green-600 text-white"
                      : ""
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add to Cart 
          </button>
        </div>
      </div>
    </div>
  );
}
