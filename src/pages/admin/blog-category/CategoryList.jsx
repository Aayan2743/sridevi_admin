import { useEffect, useState } from "react";
import api from "../../../api/axios";
import Pagination from "../../components/Pagination";
import SettingsLayout from "../../settings/SettingsLayout";
import { toast } from "react-hot-toast";

const CategoryList = () => {

  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    status: 1
  });

  /* ================= FETCH ================= */

const fetchCategories = async (page = 1) => {
  try {
    const res = await api.get(
      `/admin-dashboard/blog-categories?page=${page}`
    );

    const paginationData = res.data.data;

    setCategories(paginationData.data);
    setPagination(paginationData);

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to load categories"
    );
  }
};

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= DELETE ================= */

const deleteCategory = async (id) => {
  if (!window.confirm("Delete this category?")) return;

  try {
    const res = await api.delete(
      `/admin-dashboard/blog-categories/${id}`
    );

    toast.success(
      res?.data?.message || "Category deleted"
    );

    fetchCategories();

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Delete failed"
    );
  }
};

  /* ================= STATUS TOGGLE ================= */

const toggleStatus = async (category) => {
  try {
    const res = await api.put(
      `/admin-dashboard/blog-categories/${category.id}`,
      {
        name: category.name,
        status: category.status ? 0 : 1
      }
    );

    toast.success(
      res?.data?.message || "Status updated"
    );

    fetchCategories();

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Status update failed"
    );
  }
};

  /* ================= OPEN DRAWER ================= */

  const openDrawer = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        status: category.status
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        status: 1
      });
    }
    setIsDrawerOpen(true);
  };

  /* ================= SAVE ================= */

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    let response;

    if (editingCategory) {
      response = await api.put(
        `/admin-dashboard/blog-categories/${editingCategory.id}`,
        formData
      );
    } else {
      response = await api.post(
        `/admin-dashboard/blog-categories`,
        formData
      );
    }

    toast.success(
      response?.data?.message ||
      (editingCategory
        ? "Category updated"
        : "Category created")
    );

    fetchCategories();
    setIsDrawerOpen(false);

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

  return (
    <SettingsLayout>

      <div className="p-6 bg-gray-50 min-h-screen relative">

        <div className="flex justify-between mb-5">
          <h2 className="text-2xl font-bold">Blog Categories</h2>

          <button
            onClick={() => openDrawer()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Category
          </button>
        </div>

        {/* ================= TABLE ================= */}

        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="border-t">
                  <td className="p-3">{category.name}</td>

                  <td>
                    <button
                      onClick={() => toggleStatus(category)}
                      className={`px-2 py-1 rounded text-sm ${
                        category.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.status ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="space-x-3">
                    <button
                      onClick={() => openDrawer(category)}
                      className="text-blue-500"
                    >
                      Edit
                    </button>

                   
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            pagination={pagination}
            onPageChange={fetchCategories}
          />
        </div>

        {/* ================= RIGHT DRAWER ================= */}

        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 z-50`}
        >
          <div className="p-6 border-b flex justify-between">
            <h3 className="text-lg font-semibold">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h3>

            <button onClick={() => setIsDrawerOpen(false)}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Name Field */}
            <div>
              <label className="block mb-1 font-medium">
                Category Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* Status Field */}
            <div>
              <label className="block mb-1 font-medium">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Save
            </button>

          </form>
        </div>

      </div>

    </SettingsLayout>
  );
};

export default CategoryList;