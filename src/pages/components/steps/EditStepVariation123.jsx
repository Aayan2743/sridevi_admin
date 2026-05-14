// // src/pages/comp/EditStepVariation.jsx

// import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
// import api from "../../../api/axios";

// const EditStepVariation = forwardRef(({ productId }, ref) => {
//   useEffect(() => {
//     window.alert("EditStepVariation mounted");

//     console.log("🔥 TEST LOG");
//     console.info("🔥 TEST INFO");
//     console.warn("🔥 TEST WARN");
//     console.error("🔥 TEST ERROR");
//     console.log("🔥 EditStepVariation useEffect fired");
//   }, []);

//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD API ON PAGE LOAD ================= */
//   useEffect(() => {
//     console.log("EditStepVariation loaded");

//     const loadData = async () => {
//       try {
//         setLoading(true);

//         const res = await api.get("/dashboard/get-variations");
//         console.log("API RESPONSE:", res.data); // ✅ only console you asked for
//       } catch (err) {
//         console.error("API Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   /* ================= SAVE STEP (STATIC FOR NOW) ================= */
//   useImperativeHandle(ref, () => ({
//     async saveStep() {
//       console.log("Save step triggered (static)");

//       if (!productId) return false;

//       // 🔹 Call save API here later
//       // await api.post(`/dashboard/product/sync-variations/${productId}`, payload);

//       return true;
//     },
//   }));

//   /* ================= UI ================= */
//   return (
//     <div className="space-y-6">
//       <h3 className="font-semibold">Product Variants</h3>

//       <p className="text-sm text-gray-500">
//         Variations will be loaded from API (static mode)
//       </p>

//       {loading && (
//         <p className="text-sm text-blue-600">Loading variations...</p>
//       )}
//     </div>
//   );
// });

// export default EditStepVariation;
import { useEffect } from "react";

const EditStepVariation = () => {
  console.error("🔥 EditStepVariation rendered");

  useEffect(() => {
    console.error("🔥 useEffect mounted");
  }, []);

  return (
    <>
      <p>Edit Step Variation</p>
    </>
  );
};

export default EditStepVariation;
