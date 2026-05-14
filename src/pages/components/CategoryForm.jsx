// import { useState, useEffect } from "react";

// export default function CategoryForm({ data, onClose, onSave }) {
//   const [name, setName] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState("");

//   useEffect(() => {
//     if (data) {
//       setName(data.name || "");
//       setPreview(data.image || "");
//     }
//   }, [data]);

//   const handleImage = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = () => {
//     onSave({
//       id: data?.id,
//       name,
//       image: preview || "/logo.webp",
//     });
//   };

//   return (
//     <>
//       {/* OVERLAY */}
//       <div
//         className="fixed inset-0 bg-black/40 z-40"
//         onClick={onClose}
//       />

//       {/* RIGHT DRAWER */}
//       <div
//         className="
//           fixed top-0 right-0 z-50 h-full
//           w-full sm:w-[420px]
//           bg-white shadow-2xl
//           flex flex-col
//           animate-slide-in
//         "
//       >
//         {/* HEADER */}
//         <div className="h-16 px-6 border-b flex items-center justify-between">
//           <h2 className="text-lg font-semibold">
//             {data ? "Edit Category" : "Add Category"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-xl text-gray-500 hover:text-black"
//           >
//             ✕
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
//           {/* IMAGE UPLOAD */}
//           <div className="space-y-2">
//             <label className="text-sm text-gray-600">
//               Category Image
//             </label>

//             <div className="flex items-center gap-4">
//               <div className="w-24 h-24 rounded-lg border flex items-center justify-center overflow-hidden bg-gray-50">
//                 {preview ? (
//                   <img
//                     src={preview}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <span className="text-gray-400 text-sm">
//                     No Image
//                   </span>
//                 )}
//               </div>

//               <label className="text-indigo-600 text-sm cursor-pointer">
//                 Upload Image
//                 <input
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   onChange={handleImage}
//                 />
//               </label>
//             </div>
//           </div>

//           {/* CATEGORY NAME */}
//           <div>
//             <label className="text-sm text-gray-600">
//               Category Name
//             </label>
//             <input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full h-11 border rounded-lg px-3 mt-1"
//               placeholder="Enter category name"
//             />
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="h-16 px-6 border-t flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded border"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-6 py-2 rounded bg-indigo-600 text-white"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }



import { useState, useEffect } from "react";

export default function CategoryForm({ data, onClose, onSave }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null); // File
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setPreview(data.full_image_url || ""); // ✅ correct
      setImage(null);
    } else {
      setName("");
      setPreview("");
      setImage(null);
    }
  }, [data]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // ✅ File only
      setPreview(URL.createObjectURL(file)); // preview only
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    if (image) {
      formData.append("image", image); // 🔥 correct
    }

    onSave(formData, data?.id); // 🔥 id separately
  };

  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* DRAWER */}
      <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="h-16 px-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {data ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="text-xl text-gray-500">✕</button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          {/* IMAGE */}
          <div>
            <label className="text-sm text-gray-600">Category Image</label>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-24 h-24 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>

              <label className="text-indigo-600 text-sm cursor-pointer">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImage}
                />
              </label>
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 border rounded-lg px-3 mt-1"
              placeholder="Enter category name"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-16 px-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
