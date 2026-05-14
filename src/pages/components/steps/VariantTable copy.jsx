import { useRef } from "react";

export default function VariantTable({ variants, data, setData }) {
  const fileRefs = useRef({});

  const update = (i, field, value) => {
    setData((prev) => {
      const copy = [...prev];
      copy[i] = {
        ...copy[i],
        [field]: value,
      };
      return copy;
    });
  };

  const addImages = (i, files) => {
    const newFiles = Array.from(files);

    setData((prev) => {
      const copy = [...prev];
      copy[i] = {
        ...copy[i],
        images: [...(copy[i]?.images || []), ...newFiles],
      };
      return copy;
    });
  };

  const removeImage = (rowIndex, imgIndex) => {
    setData((prev) => {
      const copy = [...prev];
      const imgs = [...(copy[rowIndex]?.images || [])];
      imgs.splice(imgIndex, 1);

      copy[rowIndex] = {
        ...copy[rowIndex],
        images: imgs,
      };
      return copy;
    });
  };

  return (
    <div className="border rounded-xl bg-white p-6">
      <h4 className="font-semibold mb-1">Generated Variants</h4>
      <p className="text-sm text-gray-500 mb-4">
        Configure per-variant price, purchase price, SKU, stock and images.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Variant</th>
              <th className="px-3 py-2">Purchase Price</th>
              <th className="px-3 py-2">Selling Price</th>
              <th className="px-3 py-2">Discount (Rs)</th>
              <th className="px-3 py-2">HSN</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Low Qty</th>
              <th className="px-3 py-2">Photos</th>
            </tr>
          </thead>

          <tbody>
            {variants.map((v, i) => (
              <tr key={i} className="border-t align-top">
                {/* VARIANT LABEL */}
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {v.join(" / ")}
                </td>

                {/* PURCHASE PRICE */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="mini-input"
                    placeholder="0"
                    value={data[i]?.purchase_price || ""}
                    onChange={(e) =>
                      update(i, "purchase_price", e.target.value)
                    }
                  />
                </td>

                {/* Sell PRICE */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="mini-input"
                    placeholder="0"
                    value={data[i]?.price || ""}
                    onChange={(e) => update(i, "price", e.target.value)}
                  />
                </td>

                {/* Discount */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="mini-input"
                    placeholder="0"
                    value={data[i]?.discount || ""}
                    onChange={(e) => update(i, "discount", e.target.value)}
                  />
                </td>

                {/* SKU */}
                <td className="px-3 py-2">
                  <input
                    className="mini-input w-24"
                    placeholder="SKU"
                    value={data[i]?.sku || ""}
                    onChange={(e) => update(i, "sku", e.target.value)}
                  />
                </td>

                {/* QTY */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="mini-input"
                    placeholder="0"
                    value={data[i]?.qty || ""}
                    onChange={(e) => update(i, "qty", e.target.value)}
                  />
                </td>

                {/* LOW QTY */}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="mini-input"
                    placeholder="0"
                    value={data[i]?.low_qty || ""}
                    onChange={(e) => update(i, "low_qty", e.target.value)}
                  />
                </td>

                {/* IMAGES */}
                <td className="px-3 py-2">
                  <input
                    ref={(el) => (fileRefs.current[i] = el)}
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => addImages(i, e.target.files)}
                  />

                  <button
                    type="button"
                    onClick={() => fileRefs.current[i]?.click()}
                    className="upload-btn"
                  >
                    Upload
                  </button>

                  {data[i]?.images?.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      {data[i].images.length} file(s)
                    </span>
                  )}

                  {/* IMAGE PREVIEW */}
                  {data[i]?.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data[i].images.map((img, idx) => {
                        const preview = URL.createObjectURL(img);

                        return (
                          <div
                            key={idx}
                            className="relative h-14 w-14 rounded-lg border overflow-hidden"
                          >
                            <img
                              src={preview}
                              alt=""
                              className="h-full w-full object-cover"
                              onLoad={() => URL.revokeObjectURL(preview)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i, idx)}
                              className="absolute top-0 right-0
                                bg-black/70 text-white text-xs px-1"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
