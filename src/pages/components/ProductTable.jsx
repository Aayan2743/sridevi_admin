import { useEffect, useState } from "react";
import api from "../../api/axios"; // adjust path if needed

export default function ProductTable({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const perPage = 5;

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/dashboard/product/products", {
        params: {
          search,
          page,
          perPage,
        },
      });

      setProducts(res.data.data || []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD ON MOUNT & SEARCH ================= */

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="input max-w-xs"
      />

      {/* LOADING */}
      {loading && <p className="text-sm text-gray-500">Loading products...</p>}

      {/* DESKTOP TABLE */}
      {!loading && (
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No products found
                  </td>
                </tr>
              )}

              {products.map((p, i) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category?.name || "-"}</td>
                  <td className="px-4 py-3">{p.brand?.name || "-"}</td>
                  <td className="px-4 py-3">₹{p.base_price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        p.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(p)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === "published"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              {p.category?.name} • {p.brand?.name}
            </p>

            <div className="flex justify-between items-center">
              <span className="font-medium">₹{p.base_price}</span>
              <button
                onClick={() => onEdit(p)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
