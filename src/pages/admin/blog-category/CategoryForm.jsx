import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const CategoryForm = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(1);

  useEffect(() => {
    if (id) {
      api.get(`/admin-dashboard/blog-categories?page=1`)
        .then(res => {
          const category = res.data.data.data.find(c => c.id == id);
          if (category) {
            setName(category.name);
            setStatus(category.status);
          }
        });
    }
  }, [id]);

  const submit = (e) => {
    e.preventDefault();

    const payload = { name, status };

    if (id) {
      api.put(`/admin-dashboard/blog-categories/${id}`, payload)
        .then(() => navigate("/admin/blog-categories"));
    } else {
      api.post(`/admin-dashboard/blog-categories`, payload)
        .then(() => navigate("/admin/blog-categories"));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="max-w-lg bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {id ? "Edit Category" : "Create Category"}
        </h2>

        <form onSubmit={submit} className="space-y-4">

          <input
            type="text"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

        </form>
      </div>
    </div>
  );
};

export default CategoryForm;