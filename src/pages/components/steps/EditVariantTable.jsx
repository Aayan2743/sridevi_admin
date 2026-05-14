// export default function EditVariantTable({
//   variants,
//   data = [],
//   setData,
//   removeImage,
//   addImages,
// }) {
//   const update = (index, field, value) => {
//     setData((prev) => {
//       const copy = [...prev];
//       copy[index] = { ...copy[index], [field]: value };
//       return copy;
//     });
//   };

//   if (!Array.isArray(data) || data.length === 0) {
//     return (
//       <div className="text-sm text-gray-500 text-center py-6">
//         No variants generated
//       </div>
//     );
//   }

//   console.log("ssssss", data);
//   return (
//     <div className="border rounded-xl bg-white shadow-sm">
//       {/* HEADER */}
//       <div className="px-5 py-3 border-b">
//         <h4 className="font-semibold text-gray-800">Generated Variants</h4>
//         <p className="text-sm text-gray-500">
//           Configure pricing, inventory and images per variant
//         </p>
//       </div>

//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm border-collapse">
//           <thead className="bg-gray-50 text-gray-600">
//             <tr>
//               <th className="px-3 py-2 text-left">Variant</th>
//               <th className="px-3 py-2">Purchase Price</th>
//               <th className="px-3 py-2">Selling Price</th>
//               <th className="px-3 py-2">Discount (%)</th>
//               <th className="px-3 py-2">SKU</th>
//               <th className="px-3 py-2">Qty</th>
//               <th className="px-3 py-2">Low Qty</th>
//               <th className="px-3 py-2">Images</th>
//             </tr>
//           </thead>

//           <tbody>
//             {data.map((row, rowIndex) => (
//               <tr
//                 key={row.key || rowIndex}
//                 className="border-t align-top hover:bg-gray-50"
//               >
//                 {/* VARIANT LABEL */}
//                 <td className="px-3 py-2 font-medium whitespace-nowrap">
//                   {row.label}
//                 </td>

//                 {/* PURCHASE PRICE */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="number"
//                     className="w-24 border rounded px-2 py-1"
//                     value={row.purchase_price ?? ""}
//                     onChange={(e) =>
//                       update(rowIndex, "purchase_price", e.target.value)
//                     }
//                   />
//                 </td>

//                 {/* SELLING PRICE */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="number"
//                     className="w-24 border rounded px-2 py-1"
//                     value={row.price ?? ""}
//                     onChange={(e) => update(rowIndex, "price", e.target.value)}
//                   />
//                 </td>

//                 {/* DISCOUNT */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="number"
//                     className="w-20 border rounded px-2 py-1"
//                     value={row.discount ?? ""}
//                     onChange={(e) =>
//                       update(rowIndex, "discount", e.target.value)
//                     }
//                   />
//                 </td>

//                 {/* SKU */}
//                 <td className="px-3 py-2">
//                   <input
//                     className="w-32 border rounded px-2 py-1"
//                     value={row.sku ?? ""}
//                     onChange={(e) => update(rowIndex, "sku", e.target.value)}
//                   />
//                 </td>

//                 {/* QTY */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="number"
//                     className="w-20 border rounded px-2 py-1"
//                     value={row.qty ?? ""}
//                     onChange={(e) => update(rowIndex, "qty", e.target.value)}
//                   />
//                 </td>

//                 {/* LOW QTY */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="number"
//                     className="w-20 border rounded px-2 py-1"
//                     value={row.low_qty ?? ""}
//                     onChange={(e) =>
//                       update(rowIndex, "low_qty", e.target.value)
//                     }
//                   />
//                 </td>

//                 {/* IMAGES */}
//                 <td className="px-3 py-2">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     onChange={(e) =>
//                       addImages(rowIndex, Array.from(e.target.files))
//                     }
//                   />

//                   {Array.isArray(row.images) && row.images.length > 0 && (
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {row.images.map((img, idx) => {
//                         const preview =
//                           img instanceof File
//                             ? URL.createObjectURL(img)
//                             : img.image_url || img.url;

//                         return (
//                           <div
//                             key={img.id || idx}
//                             className="relative h-14 w-14 border rounded overflow-hidden"
//                           >
//                             <img
//                               src={preview}
//                               alt="variant"
//                               className="h-full w-full object-cover"
//                             />

//                             <button
//                               type="button"
//                               onClick={() => removeImage(rowIndex, idx)}
//                               className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1"
//                             >
//                               ✕
//                             </button>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
export default function EditVariantTable({
  variants,
  data = [],
  setData,
  removeImage,
  addImages,
}) {
  const update = (index, field, value) => {
    setData((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-500">
        No variants generated
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-3">
        <h4 className="font-semibold text-gray-800">Generated Variants</h4>
        <p className="text-sm text-gray-500">
          Configure pricing, inventory and images per variant
        </p>
      </div>

      <div className="max-h-[68vh] overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600 shadow-sm">
            <tr>
              <th className="px-3 py-2 text-left">Variant</th>
              <th className="px-3 py-2">Purchase Price</th>
              <th className="px-3 py-2">Selling Price</th>
              <th className="px-3 py-2">Discount (Rs)</th>
              <th className="px-3 py-2">HSN</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Low Qty</th>
              <th className="px-3 py-2">Returnable</th>
              <th className="px-3 py-2">Images</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.key} className="border-t align-top hover:bg-gray-50">
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {row.label}
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-24 rounded border px-2 py-1"
                    value={row.purchase_price ?? ""}
                    onChange={(e) =>
                      update(rowIndex, "purchase_price", e.target.value)
                    }
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-24 rounded border px-2 py-1"
                    value={row.price ?? ""}
                    onChange={(e) => update(rowIndex, "price", e.target.value)}
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-20 rounded border px-2 py-1"
                    value={row.discount ?? ""}
                    onChange={(e) =>
                      update(rowIndex, "discount", e.target.value)
                    }
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    className="w-32 rounded border px-2 py-1"
                    value={row.sku ?? ""}
                    onChange={(e) => update(rowIndex, "sku", e.target.value)}
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-20 rounded border px-2 py-1"
                    value={row.qty ?? ""}
                    onChange={(e) => update(rowIndex, "qty", e.target.value)}
                  />
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-20 rounded border px-2 py-1"
                    value={row.low_qty ?? ""}
                    onChange={(e) =>
                      update(rowIndex, "low_qty", e.target.value)
                    }
                  />
                </td>


                <td className="px-3 py-2 text-center">
                  <label className="inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={Number(row.is_returnable) === 1}
                      onChange={(e) =>
                        update(rowIndex, "is_returnable", e.target.checked ? 1 : 0)
                      }
                    />

                    <div
                      className="flex h-6 w-11 items-center rounded-full bg-red-400 p-1 transition-all peer-checked:bg-green-500"
                    >
                      <div
                        className="h-4 w-4 translate-x-0 rounded-full bg-white transition peer-checked:translate-x-5"
                      ></div>
                    </div>
                  </label>
                </td>

                <td className="px-3 py-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      addImages(rowIndex, Array.from(e.target.files))
                    }
                  />

                  {Array.isArray(row.images) && row.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {row.images.map((img, idx) => {
                        const preview =
                          img instanceof File
                            ? URL.createObjectURL(img)
                            : img.image_url || img.url;

                        return (
                          <div
                            key={img.id || idx}
                            className="relative h-14 w-14 border rounded overflow-hidden"
                          >
                            <img
                              src={preview}
                              alt="variant"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(rowIndex, idx)}
                              className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1"
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
