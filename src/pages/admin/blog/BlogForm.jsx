import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    api.get("/admin-dashboard/blog-categories-1").then(res => {
      setCategories(res.data.data);
    });

    if (id) {
      api.get(`/admin-dashboard/get-blogs/${id}`).then(res => {
        setForm(res.data.data);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    if (id) {
      api.put(`/admin-dashboard/update-blogs/${form.id}`, form).then(() => {
        navigate("/admin/blogs");
      });
    } else {
      api.post("/admin-dashboard/add-blogs", form).then(() => {
        navigate("/admin/blogs");
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Blog" : "Create Blog"}
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <select
          name="blog_category_id"
          onChange={handleChange}
          value={form.blog_category_id}
          className="w-full border p-2"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

         {/* <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.id}
         
          className="w-full border p-2"
          required
        /> */}

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />


        <textarea
          name="content"
          placeholder="Content"
          value={form.content}
          onChange={handleChange}
          className="w-full border p-2 h-32"
          required
        />

        <h3 className="font-semibold mt-6">SEO Settings</h3>

        <input
          type="text"
          name="meta_title"
          placeholder="Meta Title"
          value={form.meta_title}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <textarea
          name="meta_description"
          placeholder="Meta Description"
          value={form.meta_description}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <input
          type="text"
          name="meta_keywords"
          placeholder="Meta Keywords"
          value={form.meta_keywords}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </form>
    </div>
  );
};

export default BlogForm;