import { useEffect, useState } from "react";
import api from "../../../api/axios";
import Pagination from "../../components/Pagination";
import SettingsLayout from "../../settings/SettingsLayout";
import RichTextEditorNew from "../../components/RichTextEditorNew";
import { toast } from "react-hot-toast";

const BlogList = () => {

  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [categories, setCategories] = useState([]);

  const [metaTags, setMetaTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    blog_category_id: "",
    content: "",
    status: 1,
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  /* ================= FETCH BLOGS ================= */

const fetchBlogs = async (page = 1) => {
  try {
    const res = await api.get(`/admin-dashboard/get-blogs?page=${page}`);
    setBlogs(res.data.data.data);
    setPagination(res.data.data);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to load blogs"
    );
  }
};

  /* ================= FETCH CATEGORIES ================= */

const fetchCategories = async () => {
  try {
    const res = await api.get(`/admin-dashboard/blog-categories-1`);
    setCategories(res.data.data);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to load categories"
    );
  }
};

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  /* ================= DELETE ================= */

const deleteBlog = async (id) => {
  if (!window.confirm("Delete this blog?")) return;

  try {
    const res = await api.delete(
      `/admin-dashboard/delete-blogs/${id}`
    );

    toast.success(
      res?.data?.message || "Blog deleted successfully"
    );

    fetchBlogs();
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Delete failed"
    );
  }
};

  /* ================= TAG HANDLING ================= */

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();

      if (!metaTags.includes(tagInput.trim())) {
        setMetaTags([...metaTags, tagInput.trim()]);
      }

      setTagInput("");
    }
  };

  const removeTag = (indexToRemove) => {
    setMetaTags(metaTags.filter((_, index) => index !== indexToRemove));
  };

  /* ================= SUBMIT ================= */

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    ...formData,
    meta_keywords: metaTags.join(",")
  };

  try {
    let response;

    if (editingBlog) {
      response = await api.put(
        `/admin-dashboard/update-blogs/${editingBlog.id}`,
        payload
      );
    } else {
      response = await api.post(
        `/admin-dashboard/add-blogs`,
        payload
      );
    }

    toast.success(
      response?.data?.message ||
      (editingBlog ? "Blog updated" : "Blog created")
    );

    fetchBlogs();
    setDrawerOpen(false);

  } catch (error) {

    if (error.response?.status === 422) {
      toast.error(error.response.data.message);
    } else {
      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  }
};

  /* ================= OPEN DRAWER ================= */

  const openDrawer = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);

      setFormData({
        title: blog.title,
        blog_category_id: blog.blog_category_id,
        content: blog.content,
        status: blog.status,
        meta_title: blog.meta_title || "",
        meta_description: blog.meta_description || "",
        meta_keywords: blog.meta_keywords || ""
      });

      setMetaTags(
        blog.meta_keywords
          ? blog.meta_keywords.split(",").map(tag => tag.trim())
          : []
      );

    } else {
      setEditingBlog(null);

      setFormData({
        title: "",
        blog_category_id: "",
        content: "",
        status: 1,
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
      });

      setMetaTags([]);
    }

    setDrawerOpen(true);
  };

  return (
    <SettingsLayout>

      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between mb-5">
          <h2 className="text-2xl font-bold">Blogs</h2>

          <button
            onClick={() => openDrawer()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Blog
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id} className="border-t">
                  <td className="p-3">{blog.title}</td>
                  <td>{blog.category?.name}</td>
                  <td>
                    {blog.status ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="space-x-3">
                    <button
                      onClick={() => openDrawer(blog)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteBlog(blog.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            pagination={pagination}
            onPageChange={fetchBlogs}
          />
        </div>

      </div>

      {/* ================= RIGHT DRAWER ================= */}

      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {editingBlog ? "Edit Blog" : "Add Blog"}
          </h3>
          <button onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto h-[calc(100%-80px)]"
        >

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">
              Category <span className="text-red-500">*</span>
            </label>

            <select
              value={formData.blog_category_id}
              onChange={(e) =>
                setFormData({ ...formData, blog_category_id: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
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

          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">
              Blog Title <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block mb-1 font-medium">
              Content <span className="text-red-500">*</span>
            </label>

            {/* <textarea
              rows={4}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
            
            */}

             <RichTextEditorNew
  value={formData.content}
  onChange={(html) =>
    setFormData({ ...formData, content: html })
  }
/>
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">
              Status
            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* SEO SECTION */}
          <div className="pt-4 border-t">
            <h4 className="text-lg font-semibold mb-3 text-gray-700">
              SEO Meta Tags
            </h4>

            {/* Meta Title */}
            <div>
              <label className="block mb-1 font-medium">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, meta_title: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Meta Description */}
            <div>
              <label className="block mb-1 font-medium">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />


             
            </div>

            {/* Meta Tags Chips */}
            <div>
              <label className="block mb-2 font-medium">
                Meta Tags
              </label>

              <div className="border rounded-lg p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">

                <div className="flex flex-wrap gap-2 mb-2">
                  {metaTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type & press Enter"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

           <button
  type="submit"
  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
>
  {editingBlog ? "Update Blog" : "Save Blog"}
</button>
          </div>

        </form>
      </div>

    </SettingsLayout>
  );
};

export default BlogList;