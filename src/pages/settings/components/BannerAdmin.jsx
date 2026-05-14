// import { useEffect, useState } from "react";
// import { toast } from "react-hot-toast";
// import api from "../../../api/axios";
// import SettingsLayout from "../SettingsLayout";

// export default function BannerLandingAdmin() {
//   const emptyForm = {
//     title: "",
//     subtitle: "",
//     small_text: "",
//     button_text: "",
//     button_link: "",
//     image: null,
//     status: "Active",
//     sort_order: 0,
//   };

//   const [banners, setBanners] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [editId, setEditId] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   /* ================= FETCH ================= */
//   const fetchBanners = async () => {
//     try {
//       const res = await api.get("/admin-dashboard/landing-banners");
//       setBanners(res.data.data || []);
//     } catch {
//       toast.error("Failed to load banners");
//     }
//   };

//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   /* ================= CHANGE ================= */
//   const handleChange = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   /* ================= SAVE ================= */
//   const handleSave = async () => {
//     try {
//       const formData = new FormData();

//       Object.keys(form).forEach((key) => {
//         if (form[key] !== null) {
//           formData.append(key, form[key]);
//         }
//       });

//       if (editId && editId !== "new") {
//         await api.post(`/admin-dashboard/update-banners/${editId}`, formData);
//         toast.success("Banner updated");
//       } else {
//         await api.post("/admin-dashboard/add-banners", formData);
//         toast.success("Banner created");
//       }

//       resetForm();
//       fetchBanners();
//     } catch {
//       toast.error("Save failed");
//     }
//   };

//   /* ================= EDIT ================= */
//   const handleEdit = (banner) => {
//     setEditId(banner.id);
//     setForm({
//       ...banner,
//       image: null,
//     });
//     setPreview(banner.image_url);
//     setDrawerOpen(true);
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this banner?")) return;

//     try {
//       await api.delete(`/admin-dashboard/delete-banners/${id}`);
//       toast.success("Banner deleted");
//       fetchBanners();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   /* ================= RESET ================= */
//   const resetForm = () => {
//     setForm(emptyForm);
//     setEditId(null);
//     setPreview(null);
//     setDrawerOpen(false);
//   };

//   return (
//     <SettingsLayout>
//       <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
//         {/* ================= HEADER ================= */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-semibold">Landing Banners</h2>
//             <p className="text-sm text-gray-500">
//               Manage homepage landing banners
//             </p>
//           </div>

//           <button
//             onClick={() => {
//               setEditId("new");
//               setDrawerOpen(true);
//             }}
//             className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             + Add Banner
//           </button>
//         </div>

//         {/* ================= GRID ================= */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {banners.map((b) => (
//             <div
//               key={b.id}
//               className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
//             >
//               <div className="h-44 bg-gray-100">
//                 <img
//                   src={b.image_url}
//                   alt={b.title}
//                   className="w-full h-full object-cover"
//                 />
//               </div>

//               <div className="p-4 space-y-2">
//                 <h3 className="font-semibold text-gray-800">{b.title}</h3>

//                 <p className="text-sm text-gray-500">{b.subtitle}</p>

//                 <span
//                   className={`inline-block text-xs px-3 py-1 rounded-full ${
//                     b.status === "Active"
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-700"
//                   }`}
//                 >
//                   {b.status}
//                 </span>

//                 <div className="flex justify-between items-center pt-3">
//                   <button
//                     onClick={() => handleEdit(b)}
//                     className="text-indigo-600 text-sm font-medium hover:underline"
//                   >
//                     Edit
//                   </button>

//                   <button
//                     onClick={() => handleDelete(b.id)}
//                     className="text-red-500 text-sm font-medium hover:underline"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {banners.length === 0 && (
//           <div className="text-center py-10 text-gray-400">
//             No banners available
//           </div>
//         )}

//         {/* ================= RIGHT DRAWER ================= */}
//         {drawerOpen && (
//           <>
//             {/* Overlay */}
//             <div
//               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
//               onClick={resetForm}
//             />

//             {/* Drawer */}
//             <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
//               <div className="p-6 space-y-6">
//                 {/* Header */}
//                 <div className="flex justify-between items-center border-b pb-3">
//                   <h3 className="text-xl font-semibold">
//                     {editId === "new" ? "Add Banner" : "Edit Banner"}
//                   </h3>
//                   <button
//                     onClick={resetForm}
//                     className="text-gray-500 hover:text-black"
//                   >
//                     ✕
//                   </button>
//                 </div>

//                 {/* FORM */}
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Title
//                     </label>
//                     <input
//                       value={form.title}
//                       onChange={(e) => handleChange("title", e.target.value)}
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Subtitle
//                     </label>
//                     <input
//                       value={form.subtitle}
//                       onChange={(e) => handleChange("subtitle", e.target.value)}
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Small Text
//                     </label>
//                     <input
//                       value={form.small_text}
//                       onChange={(e) =>
//                         handleChange("small_text", e.target.value)
//                       }
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Button Text
//                     </label>
//                     <input
//                       value={form.button_text}
//                       onChange={(e) =>
//                         handleChange("button_text", e.target.value)
//                       }
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Button Link
//                     </label>
//                     <input
//                       value={form.button_link}
//                       onChange={(e) =>
//                         handleChange("button_link", e.target.value)
//                       }
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Status
//                     </label>
//                     <select
//                       value={form.status}
//                       onChange={(e) => handleChange("status", e.target.value)}
//                       className="w-full border rounded-lg px-4 py-2 text-sm"
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Banner Image
//                     </label>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const file = e.target.files[0];
//                         handleChange("image", file);
//                         if (file) {
//                           setPreview(URL.createObjectURL(file));
//                         }
//                       }}
//                       className="w-full border rounded-lg px-3 py-2 text-sm"
//                     />

//                     {preview && (
//                       <img
//                         src={preview}
//                         alt="Preview"
//                         className="mt-3 w-full h-40 object-cover rounded-lg"
//                       />
//                     )}
//                   </div>

//                   <div className="flex justify-end gap-3 pt-6 border-t">
//                     <button
//                       onClick={resetForm}
//                       className="px-5 py-2 border rounded-lg"
//                     >
//                       Cancel
//                     </button>

//                     <button
//                       onClick={handleSave}
//                       className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//                     >
//                       Save Banner
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </SettingsLayout>
//   );
// }

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../api/axios";
import SettingsLayout from "../SettingsLayout";

export default function BannerLandingAdmin() {
  const emptyForm = {
    title: "",
    subtitle: "",
    small_text: "",
    button_text: "",
    button_link: "",
    image: null,
    status: "Active",
    sort_order: 0,
  };

  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= FETCH ================= */
  const fetchBanners = async () => {
    try {
      const res = await api.get("/admin-dashboard/landing-banners");
      setBanners(res.data.data || []);
    } catch {
      toast.error("Failed to load banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= CHANGE ================= */
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (editId && editId !== "new") {
        await api.post(`/admin-dashboard/update-banners/${editId}`, formData);
        toast.success("Banner updated");
      } else {
        await api.post("/admin-dashboard/add-banners", formData);
        toast.success("Banner created");
      }

      resetForm();
      fetchBanners();
    } catch {
      toast.error("Save failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({
      ...banner,
      image: null,
    });
    setPreview(banner.image_url);
    setDrawerOpen(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await api.delete(`/admin-dashboard/delete-banners/${id}`);
      toast.success("Banner deleted");
      fetchBanners();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setPreview(null);
    setDrawerOpen(false);
  };

  return (
    <SettingsLayout>
      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-10">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Landing Banners
            </h2>
            <p className="text-sm text-gray-500">
              Manage homepage landing banners
            </p>
          </div>

          <button
            onClick={() => {
              setEditId("new");
              setDrawerOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            + Add Banner
          </button>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {banners.map((b) => (
            <div
              key={b.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />

                <span
                  className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                    b.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                  {b.title}
                </h3>

                <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>

                <div className="border-t pt-4 flex justify-between items-center">
                  <button
                    onClick={() => handleEdit(b)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    ✏ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No banners available
          </div>
        )}

        {/* ================= DRAWER ================= */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={resetForm}
            />

            <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xl font-semibold">
                    {editId === "new" ? "Add Banner" : "Edit Banner"}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* TITLE */}
                  <InputField
                    label="Title"
                    value={form.title}
                    onChange={(v) => handleChange("title", v)}
                  />

                  <InputField
                    label="Subtitle"
                    value={form.subtitle}
                    onChange={(v) => handleChange("subtitle", v)}
                  />

                  <InputField
                    label="Small Text"
                    value={form.small_text}
                    onChange={(v) => handleChange("small_text", v)}
                  />

                  <InputField
                    label="Button Text"
                    value={form.button_text}
                    onChange={(v) => handleChange("button_text", v)}
                  />

                  <InputField
                    label="Button Link"
                    value={form.button_link}
                    onChange={(v) => handleChange("button_link", v)}
                  />

                  {/* STATUS */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* IMAGE */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Banner Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        handleChange("image", file);
                        if (file) {
                          setPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />

                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mt-3 w-full h-40 object-contain rounded-lg border"
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                      onClick={resetForm}
                      className="px-5 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSave}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Save Banner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SettingsLayout>
  );
}

/* ================= REUSABLE INPUT ================= */
function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
