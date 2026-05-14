

// import { useEffect, useRef, useState } from "react";

// export default function ProductCard({ product, onClick }) {

//   console.log("Product in ProductCard:", product);
//   const images = product.image_url ? [{ image_url: product.image_url }] : [];

//   const variants = product.variants || [];

//   const [index, setIndex] = useState(0);
//   const timerRef = useRef(null);

//   const startHover = () => {
//     if (images.length <= 1) return;

//     timerRef.current = setInterval(() => {
//       setIndex((prev) => (prev + 1) % images.length);
//     }, 900);
//   };

//   const stopHover = () => {
//     clearInterval(timerRef.current);
//     timerRef.current = null;
//     setIndex(0);
//   };


//   const getFinalPrice = (price, tax) => {
//   if (tax?.gst_enabled && tax?.gst_type === "exclusive") {
//     return price + (price * tax.gst_percent) / 100;
//   }
//   return price;
// };

//   useEffect(() => {
//     return () => clearInterval(timerRef.current);
//   }, []);

//   return (
//     <div
//       onMouseEnter={startHover}
//       onMouseLeave={stopHover}
//       onClick={() => onClick(product)}
//       className="bg-white rounded-2xl border cursor-pointer hover:shadow-lg transition overflow-hidden h-48 flex flex-col"
//     >
//       {/* IMAGE */}
//       <div className="relative h-24 bg-gray-100 flex-shrink-0">
//         {images.length > 0 ? (
//           <img
//             src={images[index]?.image_url}
//             alt={product.name}
//             className="h-full w-full object-cover"
//           />
//         ) : (
//           <div className="h-full flex items-center justify-center text-gray-400 text-sm">
//             No Image 
//           </div>
//         )}
//       </div>

//       {/* INFO */}
//       <div className="p-2 flex-1 flex flex-col justify-between">
//         <div>
//           <h4 className="text-xs font-medium line-clamp-2">{product.name}</h4>

//           <p className="text-sm font-semibold mt-1">
//             ₹ {variants?.[0]?.price || 0}
//           </p>
//         </div>

//         <p className="text-xs text-gray-500">
//           {variants?.length || 0} variants
//         </p>
//       </div>
//     </div>
//   );
// }




import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product, onClick }) {
  console.log("Product in ProductCard:", product);

  const images = product.image_url
    ? [{ image_url: product.image_url }]
    : [];

  const variants = product.variants || [];

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  /* ================= IMAGE HOVER ================= */
  const startHover = () => {
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 900);
  };

  const stopHover = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIndex(0);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  /* ================= GST CALC ================= */
  const getFinalPrice = (price, tax) => {
    if (tax?.gst_enabled && tax?.gst_type === "exclusive") {
      return price + (price * tax.gst_percent) / 100;
    }
    return price;
  };

  const firstVariant = variants?.[0];

  return (
    <div
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl border cursor-pointer hover:shadow-lg transition overflow-hidden h-52 flex flex-col"
    >
      {/* ================= IMAGE ================= */}
      <div className="relative h-28 bg-gray-100 flex-shrink-0">
        
        {/* GST BADGE */}
        {product.tax?.gst_enabled &&
          product.tax?.gst_type === "exclusive" && (
            <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-[10px] px-2 py-[2px] rounded-full shadow">
              + GST {product.tax.gst_percent}%
            </span>
        )}

        {images.length > 0 ? (
          <img
            src={images[index]?.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* ================= INFO ================= */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* PRODUCT NAME */}
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
            {product.name}
          </h4>

          {/* PRICE */}
          {firstVariant && (
            <>
              <p className="text-base font-semibold mt-1 text-gray-900">
                ₹{" "}
                {getFinalPrice(
                  firstVariant.price,
                  product.tax
                ).toFixed(2)}
              </p>

              {/* ORIGINAL PRICE (if GST applied) */}
              {product.tax?.gst_enabled &&
                product.tax?.gst_type === "exclusive" && (
                  <p className="text-xs text-gray-400 line-through">
                    ₹ {firstVariant.price}
                  </p>
              )}
            </>
          )}
        </div>

        {/* VARIANT COUNT */}
        <p className="text-xs text-gray-500 mt-1">
          {variants.length} variants
        </p>
      </div>
    </div>
  );
}