import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { Phone, Mail, Clock, MessageCircle } from "lucide-react";

import { useAuth } from "../../../auth/AuthContext"; 
import AccessDenied from "../../components/AccessDenied";

export default function CustomerCareSettings() {

   const { can,permissions } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [care, setCare] = useState({
    title: "",
    time: "",
    working_days: "",
    whatsapp_number: "",
    email: "",
  });

  /* ---------------- FETCH ---------------- */
  const fetchCustomerCare = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/customer-care");

      if (res.data?.status && res.data?.data) {
        setCare({
          title: res.data.data.title || "",
          time: res.data.data.time || "",
          working_days: res.data.data.working_days || "",
          whatsapp_number: res.data.data.whatsapp_number || "",
          email: res.data.data.email || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load Customer Care details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerCare();
  }, []);

  /* ---------------- CHANGE ---------------- */
  const handleChange = (e) => {
    setCare({
      ...care,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      const res = await api.post("/admin-dashboard/customer-care", care);

      if (!res.data?.status) {
        toast.error(res.data?.errors || "Update failed");
        return;
      }

      toast.success(res.data?.message || "Customer Care updated");
      setEditMode(false);
      fetchCustomerCare();
    } catch (err) {
      toast.error(err.response?.data?.errors || "Update failed");
    }
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="p-6 text-sm text-gray-500">Loading...</div>
      </SettingsLayout>
    );
  }

   if (!can("settings.customercare")) {
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
          <h2 className="text-lg font-semibold">Customer Care</h2>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              value={care.title}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* WORKING DAYS */}
          <div>
            <label className="text-sm font-medium">Working Days *</label>
            <input
              name="working_days"
              value={care.working_days}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* TIME */}
          <div>
            <label className="text-sm font-medium">Time *</label>
            <input
              name="time"
              value={care.time}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="e.g. 9:00 AM - 8:00 PM"
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* WHATSAPP */}
          <div>
            <label className="text-sm font-medium">WhatsApp Number *</label>
            <input
              name="whatsapp_number"
              value={care.whatsapp_number}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* EMAIL */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              name="email"
              type="email"
              value={care.email}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
