import { useState, useEffect } from "react";
import api from "../../api/axios";

const BlogModal = ({ isOpen, onClose, editId, refresh }) => {

  const [form, setForm] = useState({
    id: "",
    blog_category_id: "",
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  const [categories, setCategories] = useState([]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!isOpen) return;

    api.get("/admin-dashboard/blog-categories-1")
      .then(res => {
        setCategories(res.data.data);
      });

    if (editId) {
      api.get(`/admin-dashboard/get-blogs/${editId}`)
        .then(res => {
          setForm(res.data.data);
        });
    } else {
      setForm({
        id: "",
        blog_category_id: "",
        title: "",
        content: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
      });
    }

  }, [isOpen, editId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    if (editId) {
      api.put(`/admin-dashboard/update-blogs/${form.id}`, form)
        .then(() => {
          refresh();
          onClose();
        });
    } else {
      api.post("/admin-dashboard/add-blogs", form)
        .then(() => {
          refresh();
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">

      {/* Drawer */}
      <div className="w-[500px] bg-white h-full shadow-xl overflow-y-auto">

        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {editId ? "Edit Blog" : "Create Blog"}
          </h2>

          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">

          {/* CATEGORY */}
          <div>
            <label className="block mb-1 font-medium">
              Category <span className="text-red-500">*</span>
            </label>

            <select
              name="blog_category_id"
              value={form.blog_category_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}
          <div>
            <label className="block mb-1 font-medium">
              Title <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block mb-1 font-medium">
              Content <span className="text-red-500">*</span>
            </label>

            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="w-full border p-2 rounded h-32"
              required
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">SEO Settings</h3>

            <div className="space-y-3">

              <div>
                <label className="block mb-1 font-medium">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={form.meta_title}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={form.meta_description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="meta_keywords"
                  value={form.meta_keywords}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded mt-4"
          >
            Save
          </button>

        </form>
      </div>
    </div>
  );
};

export default BlogModal;