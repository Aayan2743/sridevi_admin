import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";
export default function CustomerManagement() {

    const { can } = useAuth();


  const navigate = useNavigate(); //
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;
  const perPage = meta.per_page || 10;

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const fetchCustomers = async (pageNo = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin-dashboard/user-order-details?page=${pageNo}`,
      );
      setCustomers(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK UPLOAD ================= */
  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return alert("Enter bulk data");

    const rows = bulkInput.split("\n");

    const customers = rows.map((row) => {
      const [name, phone] = row.split(",");
      return {
        name: name?.trim(),
        phone: phone?.trim(),
      };
    });

    try {
      await api.post("/admin-dashboard/customers/bulk-store", {
        customers,
      });

      alert("Bulk customers added");
      setBulkInput("");
      fetchCustomers(page);
    } catch (err) {
      alert(err.response?.data?.message || "Bulk error");
    }
  };

  

   if (!can("customer_management.view")) {
    return (
      <AccessDenied />
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customer Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              View customer activity, add new profiles, and upload bulk customer data quickly.
            </p>
          </div>

          {can("customer_management.add") && (
            <button
              onClick={() => setOpenModal(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              + Add Customer
            </button>
          )}
        </div>
      </div>

      {/* ================= BULK SECTION ================= */}
      {can("customer_management.bulk") && (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-900">Bulk Upload</h3>
          <p className="mt-1 text-xs text-slate-500">
            Enter one customer per line in `Name,Phone` format.
          </p>
        </div>

        <textarea
          placeholder="Name,Phone
John Doe,9876543210
Jane Smith,9123456789"
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          className="h-36 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />

        <button
          onClick={handleBulkUpload}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Upload Bulk Customers
        </button>
      </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
        {loading ? (
          <p className="p-10 text-center text-slate-500">Loading customers...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Total Orders</th>
                <th className="px-4 py-3 text-left">Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.length ? customers.map((c, i) => (
                <tr
                  key={c.id}
                  className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50/80"
                  onClick={() => navigate(`/customers/${c.id}/orders`)}
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * perPage + i + 1}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>

                  <td className="px-4 py-3 text-slate-700">{c.phone}</td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {c.sales_count}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-900">
                    ₹ {c.sales_sum_grand_total ?? 0}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Page {currentPage} of {lastPage}
        </p>

        <div className="space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={currentPage === lastPage}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= ADD CUSTOMER MODAL ================= */}
      <AddCustomerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => fetchCustomers(page)}
      />
    </div>
  );
}

/* ================= ADD CUSTOMER MODAL ================= */

function AddCustomerModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async () => {
    if (!name || !phone) {
      alert("Name & Phone required");
      return;
    }

    try {
      await api.post("/admin-dashboard/customers/store", {
        name,
        phone,
      });

      alert("Customer added successfully");

      setName("");
      setPhone("");

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating customer");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Add Customer</h3>
          <p className="mt-1 text-xs text-slate-500">
            Add a customer profile for future orders and billing.
          </p>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer Name"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />

        <input
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Phone Number"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
