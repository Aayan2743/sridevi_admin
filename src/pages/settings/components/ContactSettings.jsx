import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { MapPin, Phone, Clock, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext"; 
import AccessDenied from "../../components/AccessDenied";

export default function ContactSettings() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [contact, setContact] = useState({
    title: "",
    description: "",
    address: "",
    phone_1: "",
    phone_2: "",
    working_days: "",
    working_hours: "",
    weekend_note: "",
    google_map_url: "",
  });

  /* ---------------- FETCH ---------------- */
  const fetchContact = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/contact-setting");

      if (res.data?.status && res.data?.data) {
        setContact({
          title: res.data.data.title || "",
          description: res.data.data.description || "",
          address: res.data.data.address || "",
          phone_1: res.data.data.phone_1 || "",
          phone_2: res.data.data.phone_2 || "",
          working_days: res.data.data.working_days || "",
          working_hours: res.data.data.working_hours || "",
          weekend_note: res.data.data.weekend_note || "",
          google_map_url: res.data.data.google_map_url || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load contact settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  /* ---------------- CHANGE ---------------- */
  const handleChange = (e) => {
    setContact({
      ...contact,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      const res = await api.post("/admin-dashboard/contact-setting", contact);

      if (!res.data?.status) {
        toast.error(res.data?.errors || "Update failed");
        return;
      }

      toast.success(res.data?.message || "Contact updated");
      setEditMode(false);
      fetchContact();
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

     if (!can("settings.contactsettings")) {
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
          <h2 className="text-lg font-semibold">Contact Settings</h2>

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

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TITLE */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              value={contact.title}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm font-medium">Address *</label>
            <input
              name="address"
              value={contact.address}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* PHONE 1 */}
          <div>
            <label className="text-sm font-medium">Primary Phone *</label>
            <input
              name="phone_1"
              value={contact.phone_1}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* PHONE 2 */}
          <div>
            <label className="text-sm font-medium">Secondary Phone</label>
            <input
              name="phone_2"
              value={contact.phone_2}
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
              value={contact.working_days}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* WORKING HOURS */}
          <div>
            <label className="text-sm font-medium">Working Hours *</label>
            <input
              name="working_hours"
              value={contact.working_hours}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* WEEKEND NOTE */}
          <div>
            <label className="text-sm font-medium">Weekend Note</label>
            <input
              name="weekend_note"
              value={contact.weekend_note}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>

          {/* GOOGLE MAP */}
          <div>
            <label className="text-sm font-medium">Google Map URL</label>
            <input
              name="google_map_url"
              value={contact.google_map_url}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full mt-1 border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={contact.description}
            onChange={handleChange}
            disabled={!editMode}
            rows="3"
            className="w-full mt-1 border rounded-lg p-2 text-sm"
          />
        </div>
      </div>
    </SettingsLayout>
  );
}
