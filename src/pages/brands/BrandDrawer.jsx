import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function BrandDrawer({ open, onClose, data, onSaved }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("active");
  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setPreview(data.full_image_url || "");
      setStatus(data.status || "active");
    } else {
      setName("");
      setPreview("");
      setStatus("active");
    }
    setImage(null);
  }, [data]);

  if (!open) return null;

  const handleImage = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Brand name required");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("status", status);
    if (image) fd.append("image", image);

    try {
      setLoading(true);

      if (data?.id) {
        await api.post(`/admin-dashboard/update-brand/${data.id}`, fd);
      } else {
        await api.post("/admin-dashboard/add-brand", fd);
      }

      onSaved();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* DRAWER */}
      <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col animate-slideInRight">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              {data ? "Edit Brand" : "Create Brand"}
            </h2>
            <p className="text-xs text-gray-500">
              Upload logo and manage brand
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          {/* IMAGE UPLOAD */}
          <div>
            <p className="text-sm font-medium mb-2">Brand Image</p>

            <label className="group cursor-pointer block">
              <div className="w-full h-40 rounded-xl border border-dashed bg-gray-50 flex items-center justify-center overflow-hidden relative">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">
                    Click to upload image
                  </span>
                )}

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm">
                  Change Image
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImage(e.target.files[0])}
              />
            </label>
          </div>

          {/* BRAND NAME */}
          <div>
            <label className="text-sm font-medium">Brand Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eg: Nike"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  status === "active"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600"
                }`}
              >
                Active
              </button>

              <button
                type="button"
                onClick={() => setStatus("inactive")}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  status === "inactive"
                    ? "bg-gray-700 text-white border-gray-700"
                    : "bg-white text-gray-600"
                }`}
              >
                Inactive
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Inactive brands won’t be visible to users
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Brand"}
          </button>
        </div>
      </div>
    </>
  );
}
