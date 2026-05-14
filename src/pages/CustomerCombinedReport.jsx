import { useEffect, useState } from "react";
import api from "../api/axios"; // adjust path if needed

export default function CustomerCombinedReport() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openWishlist, setOpenWishlist] = useState(null);
  const [openOrders, setOpenOrders] = useState(null);

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const fetchCustomers = async (pageNo) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin-dashboard/user-details?page=${pageNo}`);
      setCustomers(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Customer Report</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading customers...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-center">Wishlist</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}

              {customers.map((c, i) => (
                <>
                  {/* MAIN ROW */}
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(meta.current_page - 1) * meta.per_page + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">{c.phone}</td>

                    {/* WISHLIST */}
                    <td
                      className="px-4 py-3 text-center text-indigo-600 cursor-pointer hover:underline"
                      onClick={() =>
                        setOpenWishlist(openWishlist === i ? null : i)
                      }
                    >
                      {c.wishlist}
                    </td>

                    {/* ORDERS */}
                    <td
                      className="px-4 py-3 text-center text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => setOpenOrders(openOrders === i ? null : i)}
                    >
                      {c.orders}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {c.total_amount}
                    </td>
                  </tr>

                  {/* WISHLIST DETAILS (READY FOR API) */}
                  {openWishlist === i && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-6 py-4">
                        <h3 className="font-semibold mb-2">
                          Wishlist Products
                        </h3>
                        <p className="text-sm text-gray-400">
                          Fetch wishlist products by customer ID
                        </p>
                      </td>
                    </tr>
                  )}

                  {/* ORDER DETAILS (READY FOR API) */}
                  {openOrders === i && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-6 py-4">
                        <h3 className="font-semibold mb-2">Orders</h3>
                        <p className="text-sm text-gray-400">
                          Fetch orders list by customer ID
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {meta.current_page} of {meta.last_page}
        </p>

        <div className="space-x-2">
          <button
            disabled={meta.current_page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={meta.current_page === meta.last_page}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
