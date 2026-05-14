import { useState, useEffect } from "react";
import CategoryForm from "./CategoryForm";
import BulkCategoryForm from "./BulkCategoryForm";
import useDynamicTitle from "../hooks/useDynamicTitle";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";
import {
  confirmAction,
  showErrorToast,
  showSuccessToast,
} from "../utils/swal";

const PAGE_SIZES = [5, 10, 20];

export default function AddCategory() {
  useDynamicTitle("Categories");

  const { can, permissions } = useAuth();


  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [openForm, setOpenForm] = useState(false);
  const [openBulkForm, setOpenBulkForm] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/list-category", {
        params: { search, page, perPage },
      });

      setCategories(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, page, perPage]);

  /* ================= CRUD ================= */
  const handleAdd = () => {
    setEditData(null);
    setOpenForm(true);
  };

  const handleEdit = (cat) => {
    setEditData(cat);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction("Delete this category?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin-dashboard/delete-category/${id}`);
      showSuccessToast("Category deleted");
      fetchCategories();
    } catch (e) {
      showErrorToast(e.response?.data?.message || "Delete failed");
    }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) {
        await api.post(`/admin-dashboard/update-category/${id}`, formData);
      } else {
        await api.post("/admin-dashboard/add-category", formData);
      }

      setOpenForm(false);
      setEditData(null);
      fetchCategories();
      showSuccessToast(id ? "Category updated" : "Category added");
    } catch (e) {
      showErrorToast(e.response?.data?.message || "Save failed");
    }
  };


  const handleToggle = async (id, type) => {
    try {
      await api.post("/admin-dashboard/toggle-category", {
        id,
        type, // "pos" or "ecom"
      });

      // refresh data
      fetchCategories();
      showSuccessToast("Status updated");

    } catch (e) {
      showErrorToast("Toggle failed");
    }
  };


  if (!can("categories.view")) {
    return (
      <AccessDenied />
    );
  }


  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage categories with quick search, status controls, and fast edit actions.
            </p>
            <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Loaded: {categories.length} categories
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-11 w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />

            {can("categories.bulk") && (
              <button
                onClick={() => setOpenBulkForm(true)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                + Bulk Add
              </button>
            )}

            {can("categories.add") && (
              <button
                onClick={handleAdd}
                className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                + Add Category
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/80 text-slate-700">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Action</th>
              {can("categories.pos") && <th className="p-3 text-left">POS</th>}
              {can("categories.ecom") && <th className="p-3 text-left">Ecom</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : categories.length ? (
              categories.map((cat) => (
                <tr key={cat.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="p-3">
                    <CategoryImage image={cat.full_image_url} />
                  </td>

                  <td className="p-3">
                    <p className="font-medium text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-500">ID: {cat.id}</p>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {can("categories.edit") && (
                        <button
                          onClick={() => handleEdit(cat)}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          Edit
                        </button>
                      )}

                      {can("categories.delete") && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>

                  {can("categories.pos") && (
                    <td className="p-3">
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={cat.is_active_pos == 1}
                          onChange={() => handleToggle(cat.id, "pos")}
                        />
                        <span className="relative h-6 w-11 rounded-full bg-red-400 transition-colors duration-200 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
                      </label>
                    </td>
                  )}

                  {can("categories.ecom") && (
                    <td className="p-3">
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={cat.is_active_ecom == 1}
                          onChange={() => handleToggle(cat.id, "ecom")}
                        />
                        <span className="relative h-6 w-11 rounded-full bg-red-400 transition-colors duration-200 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
                      </label>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No categories found</p>
                  <p className="mt-1 text-xs text-slate-500">Try another keyword or add a new category.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">Loading...</p>
        ) : categories.length ? (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start gap-3">
                  <CategoryImage image={cat.full_image_url} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-500">ID: {cat.id}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {can("categories.edit") && (
                        <button
                          onClick={() => handleEdit(cat)}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                        >
                          Edit
                        </button>
                      )}
                      {can("categories.delete") && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex gap-4">
                      {can("categories.pos") && (
                        <label className="text-xs text-slate-600">
                          POS{" "}
                          <input
                            type="checkbox"
                            className="ml-1"
                            checked={cat.is_active_pos == 1}
                            onChange={() => handleToggle(cat.id, "pos")}
                          />
                        </label>
                      )}
                      {can("categories.ecom") && (
                        <label className="text-xs text-slate-600">
                          Ecom{" "}
                          <input
                            type="checkbox"
                            className="ml-1"
                            checked={cat.is_active_ecom == 1}
                            onChange={() => handleToggle(cat.id, "ecom")}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-slate-700">No categories found</p>
            <p className="mt-1 text-xs text-slate-500">Add your first category to get started.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Rows per page</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(+e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  page === i + 1
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {openForm && (
        <CategoryForm
          data={editData}
          onClose={() => setOpenForm(false)}
          onSave={handleSave}
        />
      )}

      {openBulkForm && (
        <BulkCategoryForm
          onClose={() => setOpenBulkForm(false)}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
}

/* ================= IMAGE COMPONENT ================= */
function CategoryImage({ image }) {
  return (
    <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      {image ? (
        <img
          src={image}
          alt="Category"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] font-medium text-slate-400">
          No Image
        </div>
      )}
    </div>
  );
}
