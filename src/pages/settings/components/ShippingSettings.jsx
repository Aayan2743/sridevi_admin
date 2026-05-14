

import SettingsLayout from "../SettingsLayout";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

export default function ShippingSettings() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);


  const defaultShipping = {
    shiprocket: { base_url: "", email: "", password: "", enabled: false },
    shipmozo: { base_url: "", api_key: "", secret: "", enabled: false },
    xpressbees: { base_url: "", api_key: "", enabled: false },
    dtdc: { base_url: "", api_key: "", enabled: false },
    delhivery: { base_url: "", api_key: "", enabled: false },
    ekart: { base_url: "", api_key: "", enabled: false },
  };

  const [shipping, setShipping] = useState(defaultShipping);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    fetchShipping();
  }, []);

  const fetchShipping = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/shipping");

      console.log("Shipping API Response:", res.data);

      if (res?.data?.success && typeof res.data.data === "object") {
        const apiData = res.data.data;

        setShipping((prev) => ({
          shiprocket: {
            ...prev.shiprocket,
            ...apiData.shiprocket,
          },
          shipmozo: {
            ...prev.shipmozo,
            ...apiData.shipmozo,
          },
          xpressbees: {
            ...prev.xpressbees,
            ...apiData.xpressbees,
          },
          dtdc: {
            ...prev.dtdc,
            ...apiData.dtdc,
          },
          delhivery: {
            ...prev.delhivery,
            ...apiData.delhivery,
          },
          ekart: {
            ...prev.ekart,
            ...apiData.ekart,
          },
        }));
      } else {
        console.warn("Invalid shipping response structure");
      }
    } catch (err) {
      const message =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        "Update failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      await api.post("/admin-dashboard/shipping", shipping);
      toast.success("Shipping settings updated");
      setEditMode(false);
      setDirty(false);
      fetchShipping();
    } catch (err) {
      const message =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        "Update failed";

      toast.error(message);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setDirty(false);
    fetchShipping();
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="p-6 text-sm text-gray-500">Loading...</div>
      </SettingsLayout>
    );
  }

  
   if (!can("settings.shippingproviders")) {
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
      <div className="bg-white rounded-xl border p-6 space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Shipping Providers</h2>

          {!editMode ? (

  
    can("settings.shippingprovidersedit") && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Edit
            </button>

    )
  


          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!dirty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
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
          )}
        </div>

        {Object.keys(shipping).map((provider) => (
          <ShippingCard
            key={provider}
            title={provider.charAt(0).toUpperCase() + provider.slice(1)}
            editMode={editMode}
            data={shipping[provider]}
            onChange={(val) => {
              setDirty(true);
              setShipping((p) => ({ ...p, [provider]: val }));
            }}
          />
        ))}
      </div>
    </SettingsLayout>
  );
}

/* ---------------- SHIPPING CARD ---------------- */
function ShippingCard({ title, editMode, data, onChange }) {
  const [showSecret, setShowSecret] = useState({});

  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex justify-between items-center">
        <div className="font-medium">{title}</div>
        <ToggleSwitch
          checked={data.enabled || false}
          disabled={!editMode}
          onChange={(val) => onChange({ ...data, enabled: val })}
        />
      </div>

      {Object.keys(data)
        .filter((k) => k !== "enabled")
        .map((key) => (
          <div key={key} className="relative">
            <input
              type={
                key.toLowerCase().includes("password") ||
                key.toLowerCase().includes("secret")
                  ? !showSecret[key]
                    ? "password"
                    : "text"
                  : "text"
              }
              value={data[key] || ""}
              disabled={!editMode}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              placeholder={key.replace("_", " ").toUpperCase()}
              className="w-full border rounded-lg px-3 py-2 text-sm pr-10"
            />

            {(key.toLowerCase().includes("password") ||
              key.toLowerCase().includes("secret")) &&
              editMode && (
                <button
                  type="button"
                  onClick={() =>
                    setShowSecret((s) => ({
                      ...s,
                      [key]: !s[key],
                    }))
                  }
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showSecret[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
          </div>
        ))}
    </div>
  );
}

/* ---------------- TOGGLE SWITCH ---------------- */
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
