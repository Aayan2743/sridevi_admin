// import { useState } from "react";

// export default function ProductCard({ product, onAdd }) {
//   const hasVariations = product.variations?.length > 0;

//   const [selectedVar, setSelectedVar] = useState(
//     hasVariations ? product.variations[0] : null
//   );

//   return (
//     <div className="bg-white rounded-xl p-3 border flex flex-col gap-2">
//       {/* IMAGE */}
//       {product.image && (
//         <img
//           src={product.image}
//           alt={product.name}
//           className="h-24 w-full object-cover rounded"
//         />
//       )}

//       {/* NAME */}
//       <h4 className="font-medium text-sm">{product.name}</h4>

//       {/* VARIATION SELECT */}
//       {hasVariations && (
//         <select
//           className="border rounded px-2 py-1 text-sm"
//           value={selectedVar?.id}
//           onChange={(e) =>
//             setSelectedVar(
//               product.variations.find((v) => v.id === Number(e.target.value))
//             )
//           }
//         >
//           {product.variations.map((v) => (
//             <option key={v.id} value={v.id}>
//               {v.name} — ₹{v.price}
//             </option>
//           ))}
//         </select>
//       )}

//       {/* PRICE */}
//       <p className="text-sm text-gray-600">Price: ₹{selectedVar?.price}</p>

//       {/* ADD BUTTON */}
//       <button
//         className="mt-auto bg-black text-white rounded py-1 text-sm"
//         onClick={() =>
//           onAdd({
//             product_id: product.id,
//             product_name: product.name,
//             variation_id: selectedVar.id,
//             variation_name: selectedVar.name,
//             sku: selectedVar.sku,
//             price: selectedVar.price,
//           })
//         }
//       >
//         Add
//       </button>
//     </div>
//   );
// }

export default function ProductCard({ product, onClick }) {
  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-xl p-3 border cursor-pointer hover:shadow"
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="h-24 w-full object-cover rounded"
        />
      )}

      <h4 className="font-medium text-sm mt-2">{product.name}</h4>

      <p className="text-xs text-gray-500">
        {product.variations.length} variations
      </p>
    </div>
  );
}
