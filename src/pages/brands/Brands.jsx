import { useState, useEffect } from "react";

import api from "../../api/axios";
import BrandDrawer from "./BrandDrawer";
import useDynamicTitle from "../../hooks/useDynamicTitle";

export default function Brands() {
  useDynamicTitle("Brands");
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  /* 📄 FETCH BRANDS */
  const fetchBrands = async () => {
    try {
      const res = await api.get("/admin-dashboard/list-brand", {
        params: { search, page, perPage },
      });
      setBrands(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search, page, perPage]);

  /* 🗑 DELETE */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    await api.delete(`/admin-dashboard/delete-brand/${id}`);
    fetchBrands();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Brands</h1>

        <div className="flex gap-3">
          <input
            placeholder="Search brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 border rounded-lg text-sm w-64"
          />

          <button
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Brand
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Brand Name</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-4">
                  {b.full_image_url ? (
                    <img
                      src={b.full_image_url}
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {b.name.charAt(0)}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-gray-400">Brand</p>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="px-4 py-4 space-x-4">
                  <button
                    onClick={() => {
                      setEditData(b);
                      setOpen(true);
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {brands.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-12 text-gray-500">
                  No brands found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>entries</span>
        </div>

        <div className="flex gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

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

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* DRAWER */}
      <BrandDrawer
        open={open}
        onClose={() => setOpen(false)}
        data={editData}
        onSaved={fetchBrands}
      />
    </div>
  );
}
