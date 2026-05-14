


import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext"; 
import AccessDenied from "../../components/AccessDenied";

export default function CouponSettings() {


    const { can,permissions } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyCoupon = {
    code: "",
    type: "percent",
    value: "",
    min_order: "",
    max_discount: "",
    expiry_date: "",
    is_active: true,
  };

  const [form, setForm] = useState(emptyCoupon);

  /* ================= FETCH COUPONS ================= */
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin-dashboard/cart/list-coupon");
      setCoupons(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleEdit = (coupon) => {
    setEditId(coupon.id);
    setForm({
      ...coupon,
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split("T")[0] : "",
    });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyCoupon);
  };

  const handleSave = async () => {
    try {
      if (editId && editId !== "new") {
        await api.put(`/admin-dashboard/cart/update-coupon/${editId}`, form);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/admin-dashboard/cart/create-coupon", form);
        toast.success("Coupon created successfully");
      }

      handleCancel();
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save coupon");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this coupon?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin-dashboard/cart/delete-coupon/${id}`);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete coupon");
    }
  };


     if (!can("settings.couponsettings")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Coupon Settings</h2>

          {editId === null && (
            <button
              onClick={() => setEditId("new")}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              + Add Coupon
            </button>
          )}
        </div>

        {/* FORM */}
        {editId && (
          <div className="grid grid-cols-12 gap-4 border rounded-lg p-4">
            <div className="col-span-12 md:col-span-3">
              <input
                placeholder="Coupon Code"
                value={form.code}
                onChange={(e) =>
                  handleChange("code", e.target.value.toUpperCase())
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-2">
              <input
                type="number"
                placeholder="Value"
                value={form.value}
                onChange={(e) => handleChange("value", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <input
                type="number"
                placeholder="Min Order"
                value={form.min_order}
                onChange={(e) => handleChange("min_order", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <input
                type="number"
                placeholder="Max Discount"
                value={form.max_discount || ""}
                onChange={(e) => handleChange("max_discount", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => handleChange("expiry_date", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="col-span-12 flex gap-2 justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Value</th>
                <th className="p-2 border">Min Order</th>
                <th className="p-2 border">Expiry</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-2 border font-medium">{c.code}</td>
                  <td className="p-2 border">{c.type}</td>
                  <td className="p-2 border">
                    {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="p-2 border">₹{c.min_order}</td>
                  <td className="p-2 border">
                    {c.expiry_date ? c.expiry_date.split("T")[0] : "-"}
                  </td>
                  <td className="p-2 border">{c.is_active ? "Active" : "Inactive"}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-blue-600 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No coupons added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          Coupons will be applied during checkout before payment.
        </p>
      </div>
    </SettingsLayout>
  );
}
