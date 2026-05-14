import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import RichTextEditor from "../../components/RichTextEditor";

import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

export default function BannerSettings() {
      const { can,permissions } = useAuth();
  const [banners, setBanners] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const emptyBanner = {
    title: "",
    subtitle: "",
    description: "",
    button_text: "",
    button_link: "",
    start_date: "",
    end_date: "",
    image: null,
    status: true,
  };

  const [form, setForm] = useState(emptyBanner);

  /* ================= FETCH BANNERS ================= */
  const fetchBanners123 = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin-dashboard/banners");
      setBanners(res.data.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin-dashboard/banners");

      const formatted = (res.data.data.data || []).map((b) => ({
        ...b,
        status: b.status == 1 || b.status === "1" || b.status === true,
      }));

      setBanners(formatted);
    } catch (err) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({
      ...banner,
      start_date: banner.start_date?.split("T")[0] || "",
      end_date: banner.end_date?.split("T")[0] || "",
      image: null,
    });

    setImagePreview(banner.image || null);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyBanner);
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      if (editId && editId !== "new") {
        await api.post(`/admin-dashboard/banners/${editId}`, formData);
        toast.success("Banner updated successfully");
      } else {
        await api.post("/admin-dashboard/banners", formData);
        toast.success("Banner created successfully");
      }

      handleCancel();
      fetchBanners();
    } catch (err) {
      toast.error("Failed to save banner");
    }
  };

  const getScheduleStatus = (banner) => {
    const now = new Date();
    const start = banner.start_date ? new Date(banner.start_date) : null;
    const end = banner.end_date ? new Date(banner.end_date) : null;

    if (start && now < start) return "Scheduled";
    if (end && now > end) return "Expired";
    return "Running";
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin-dashboard/banners/${id}/status`);
      toast.success("Status updated");
      fetchBanners();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await api.delete(`/admin-dashboard/banners/${id}`);
      toast.success("Banner deleted");
      fetchBanners();
    } catch (err) {
      toast.error("Delete failed");
    }
  };



     if (!can("settings.bannersettings")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Banner Settings</h2>

          {editId === null && (
            <button
              onClick={() => setEditId("new")}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              + Add Banner
            </button>
          )}
        </div>

        {/* FORM */}
        {editId && (
          <div className="grid grid-cols-12 gap-4 border rounded-lg p-4">
            {/* Title */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Subtitle */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                value={form.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Description */}
            <div className="col-span-12">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(value) => handleChange("description", value)}
              />
            </div>

            {/* Button Text */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Button Text
              </label>
              <input
                value={form.button_text}
                onChange={(e) => handleChange("button_text", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Button Link */}
            <div className="col-span-12 md:col-span-5">
              <label className="block text-sm font-medium mb-1">
                Button Link
              </label>
              <input
                value={form.button_link}
                onChange={(e) => handleChange("button_link", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Start Date */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-12 md:col-span-4">
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
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 h-32 rounded-lg border object-cover"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="col-span-12 flex gap-2 justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LIST TABLE (UNCHANGED) */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Schedule</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td className="p-2 border font-medium">{b.title}</td>
                  <td className="p-2 border">
                    {b.start_date?.split("T")[0]} → {b.end_date?.split("T")[0]}
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(b.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          b.status ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            b.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          getScheduleStatus(b) === "Running"
                            ? "bg-green-100 text-green-700"
                            : getScheduleStatus(b) === "Scheduled"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getScheduleStatus(b)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="text-blue-600 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && banners.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No banners added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsLayout>
  );
}
