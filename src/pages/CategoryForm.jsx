import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CategoryForm({ data, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    parent_id: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PARENTS ================= */
  useEffect(() => {
    api
      .get("/admin-dashboard/list-category", { params: { perPage: 100 } })
      .then((res) => {
        const mainCats = res.data.data.filter(
          (c) => !c.parent_id && c.id !== data?.id,
        );
        setParents(mainCats);
      });
  }, [data]);

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        parent_id: data.parent_id || "",
        image: null,
      });
      setPreview(data.full_image_url || null);
    }
  }, [data]);

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleImage = (file) => {
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("name", form.name);
    if (form.parent_id) fd.append("parent_id", form.parent_id);
    if (form.image) fd.append("image", form.image);

    setLoading(true);
    await onSave(fd, data?.id);
    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* DRAWER */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl flex flex-col animate-slideIn">
        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {data ? "Edit Category" : "Create Category"}
            </h2>
            <p className="text-xs text-gray-500">
              Manage categories and sub-categories
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* IMAGE PREVIEW */}
          <div>
            <p className="text-sm font-medium mb-2">Category Image</p>

            <label className="group cursor-pointer block">
              <div className="relative w-full h-40 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    Click to upload image
                    <br />
                    <span className="text-xs">PNG, JPG, WEBP</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm">
                  Change Image
                </div>
              </div>

              <input
                type="file"
                hidden
                onChange={(e) => handleImage(e.target.files[0])}
              />
            </label>
          </div>

          {/* CATEGORY NAME */}
          <div>
            <label className="text-sm font-medium">Category Name</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Eg: Electronics"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* PARENT CATEGORY */}
          {/* <div>
            <label className="text-sm font-medium">Parent Category</label>
            <select
              value={form.parent_id}
              onChange={(e) => handleChange("parent_id", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Main Category</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a parent to create a sub-category
            </p>
          </div> */}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </>
  );
}
