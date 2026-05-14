import { useState, useEffect } from "react";
import CategoryForm from "./CategoryForm";
import SubCategoryForm from "./SubCategoryForm";
import useDynamicTitle from "../hooks/useDynamicTitle";
import api from "../api/axios";

const PAGE_SIZES = [5, 10, 20];

export default function Category() {
  useDynamicTitle("Categories");

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [openSubForm, setOpenSubForm] = useState(false);
  const [parentCategory, setParentCategory] = useState(null);

  /* 🔥 Parent autosuggest states */
  const [parentSearch, setParentSearch] = useState("");
  const [parentSuggestions, setParentSuggestions] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);

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

  /* ================= AUTO SUGGEST ================= */
  useEffect(() => {
    if (!parentSearch.trim()) {
      setParentSuggestions([]);
      return;
    }

    const parents = categories.filter(
      (c) =>
        !c.parent_id &&
        c.name.toLowerCase().includes(parentSearch.toLowerCase()),
    );

    setParentSuggestions(parents);
  }, [parentSearch, categories]);

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
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/admin-dashboard/delete-category/${id}`);
      fetchCategories();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
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
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    }
  };

  const handleAddSubCategory = (cat) => {
    setParentCategory(cat);
    setOpenSubForm(true);
  };

  /* ================= FILTER RESULT ================= */
  const displayedCategories = selectedParent
    ? categories.filter(
        (c) => c.id === selectedParent.id || c.parent_id === selectedParent.id,
      )
    : categories;

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Categories</h1>

        <div className="flex gap-3 flex-wrap items-start">
          {/* Normal Search */}
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-lg w-60"
          />

          {/* 🔥 Parent Auto Suggest */}
          <div className="relative w-64">
            <input
              value={parentSearch}
              onChange={(e) => {
                setParentSearch(e.target.value);
                setSelectedParent(null);
              }}
              placeholder="Search Parent Category..."
              className="border px-3 py-2 rounded-lg w-full"
            />

            {parentSuggestions.length > 0 && (
              <div className="absolute z-30 bg-white border rounded-lg shadow w-full mt-1 max-h-48 overflow-auto">
                {parentSuggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedParent(p);
                      setParentSearch(p.name);
                      setParentSuggestions([]);
                    }}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedParent && (
            <button
              onClick={() => {
                setSelectedParent(null);
                setParentSearch("");
              }}
              className="text-sm text-red-500"
            >
              Clear Parent Filter
            </button>
          )}

          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Category 
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Parent</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : displayedCategories.length ? (
              displayedCategories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3">
                    <CategoryImage image={cat.full_image_url} />
                  </td>

                  <td className="p-3 font-medium">{cat.name}</td>

                  <td className="p-3 text-gray-500">
                    {cat.parent_name || "—"}
                  </td>

                  <td className="p-3 space-x-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-indigo-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>

                    {!cat.parent_id && (
                      <button
                        onClick={() => handleAddSubCategory(cat)}
                        className="text-green-600"
                      >
                        Add Sub Category
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(+e.target.value);
              setPage(1);
            }}
            className="border px-2 py-1 rounded"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1 ? "bg-indigo-600 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {openForm && (
        <CategoryForm
          data={editData}
          onClose={() => setOpenForm(false)}
          onSave={handleSave}
        />
      )}

      {openSubForm && parentCategory && (
        <SubCategoryForm
          category={parentCategory}
          onClose={() => setOpenSubForm(false)}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
}

/* ================= IMAGE ================= */
function CategoryImage({ image }) {
  return (
    <div className="w-12 h-12 border rounded bg-gray-100 overflow-hidden">
      {image ? (
        <img src={image} className="w-full h-full object-cover" />
      ) : (
        <div className="text-xs text-gray-400 flex items-center justify-center h-full">
          No Image
        </div>
      )}
    </div>
  );
}
