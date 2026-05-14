import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { CreditCard, Wallet, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

export default function PaymentGatewaySettings() {

    const { can,permissions } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [gateways, setGateways] = useState({
    razorpay: { key: "", enabled: false },
    cashfree: { key: "", enabled: false },

    phonepe: {
      merchant_id: "",
      client_id: "",
      client_version: "",
      base_url: "",
      enabled: false,
    },

    payu: { key: "", enabled: false },

    cod: { enabled: true },
  });

  const [secrets, setSecrets] = useState({
    razorpay: "",
    cashfree: "",
    phonepe: "",
    payu: "",
  });

  const [showSecret, setShowSecret] = useState({
    razorpay: false,
    cashfree: false,
    phonepe: false,
    payu: false,
  });

  /* ---------------- LOAD ---------------- */
  // const fetchGateways = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await api.get("/admin-dashboard/payment-gateways");
  //     const d = res.data.data;

  //     setGateways({
  //       razorpay: {
  //         key: d?.razorpay_key || "",
  //         enabled: !!d?.razorpay_enabled,
  //       },
  //       cashfree: {
  //         key: d?.cashfree_app_id || "",
  //         enabled: !!d?.cashfree_enabled,
  //       },
  //       phonepe: {
  //         merchant_id: d?.phonepe_merchant_id || "",
  //         client_id: d?.phonepe_client_id || "",
  //         client_version: d?.phonepe_client_version || "",
  //         base_url: d?.phonepe_base_url || "",
  //         enabled: !!d?.phonepe_enabled,
  //       },
  //       payu: {
  //         key: d?.payu_key || "",
  //         enabled: !!d?.payu_enabled,
  //       },
  //       cod: { enabled: !!d?.cod_enabled },
  //     });

  //     setSecrets({
  //       razorpay: "",
  //       cashfree: "",
  //       phonepe: "",
  //       payu: "",
  //     });

  //     setDirty(false);
  //   } catch {
  //     toast.error("Failed to load payment gateways");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/payment-gateways");
      const d = res.data.data;

      setGateways({
        razorpay: {
          key: d?.razorpay_key || "",
          enabled: !!d?.razorpay_enabled,
        },
        cashfree: {
          key: d?.cashfree_app_id || "",
          enabled: !!d?.cashfree_enabled,
        },
        phonepe: {
          merchant_id: d?.phonepe_merchant_id || "",
          client_id: d?.phonepe_client_id || "",
          client_version: d?.phonepe_client_version || "",
          base_url: d?.phonepe_base_url || "",
          enabled: !!d?.phonepe_enabled,
        },
        payu: {
          key: d?.payu_key || "",
          enabled: !!d?.payu_enabled,
        },
        cod: { enabled: !!d?.cod_enabled },
      });

      // ✅ LOAD SECRETS FROM BACKEND
      setSecrets({
        razorpay: d?.razorpay_secret || "",
        cashfree: d?.cashfree_secret || "",
        phonepe: d?.phonepe_client_secret || "",
        payu: d?.payu_salt || "",
      });

      setDirty(false);
    } catch {
      toast.error("Failed to load payment gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      const payload = {
        razorpay_key: gateways.razorpay.key,
        razorpay_enabled: gateways.razorpay.enabled,

        cashfree_app_id: gateways.cashfree.key,
        cashfree_enabled: gateways.cashfree.enabled,

        phonepe_merchant_id: gateways.phonepe.merchant_id,
        phonepe_client_id: gateways.phonepe.client_id,
        phonepe_client_version: gateways.phonepe.client_version,
        phonepe_base_url: gateways.phonepe.base_url,
        phonepe_enabled: gateways.phonepe.enabled,

        payu_key: gateways.payu.key,
        payu_enabled: gateways.payu.enabled,

        cod_enabled: gateways.cod.enabled,
      };

      if (secrets.razorpay) payload.razorpay_secret = secrets.razorpay;

      if (secrets.cashfree) payload.cashfree_secret = secrets.cashfree;

      if (secrets.phonepe) payload.phonepe_client_secret = secrets.phonepe;

      if (secrets.payu) payload.payu_salt = secrets.payu;

      await api.post("/admin-dashboard/payment-gateways", payload);
      toast.success("Payment gateway settings updated");

      setEditMode(false);
      fetchGateways();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchGateways();
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="p-6 text-sm text-gray-500">Loading…</div>
      </SettingsLayout>
    );
  }


  
   if (!can("settings.paymentgateway")) {
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
          <h2 className="text-lg font-semibold">Payment Gateway</h2>

          {!editMode ? (

            
    can("settings.paymentgatewayedit") && (
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

        {/* RAZORPAY */}
        <GatewaySimple
          title="Razorpay"
          editMode={editMode}
          data={gateways.razorpay}
          onChange={(val) => {
            setDirty(true);
            setGateways((p) => ({ ...p, razorpay: val }));
          }}
          secret={secrets.razorpay}
          setSecret={(val) => {
            setDirty(true);
            setSecrets((s) => ({ ...s, razorpay: val }));
          }}
          showSecret={showSecret.razorpay}
          toggleSecret={() =>
            setShowSecret((s) => ({ ...s, razorpay: !s.razorpay }))
          }
        />

        {/* CASHFREE */}
        <GatewaySimple
          title="Cashfree"
          editMode={editMode}
          data={gateways.cashfree}
          onChange={(val) => {
            setDirty(true);
            setGateways((p) => ({ ...p, cashfree: val }));
          }}
          secret={secrets.cashfree}
          setSecret={(val) => {
            setDirty(true);
            setSecrets((s) => ({ ...s, cashfree: val }));
          }}
          showSecret={showSecret.cashfree}
          toggleSecret={() =>
            setShowSecret((s) => ({ ...s, cashfree: !s.cashfree }))
          }
        />

        {/* PHONEPE */}
        <GatewayPhonePe
          editMode={editMode}
          data={gateways.phonepe}
          onChange={(val) => {
            setDirty(true);
            setGateways((p) => ({ ...p, phonepe: val }));
          }}
          secret={secrets.phonepe}
          setSecret={(val) => {
            setDirty(true);
            setSecrets((s) => ({ ...s, phonepe: val }));
          }}
          showSecret={showSecret.phonepe}
          toggleSecret={() =>
            setShowSecret((s) => ({ ...s, phonepe: !s.phonepe }))
          }
        />

        {/* PAYU */}
        <GatewaySimple
          title="PayU"
          editMode={editMode}
          data={gateways.payu}
          onChange={(val) => {
            setDirty(true);
            setGateways((p) => ({ ...p, payu: val }));
          }}
          secret={secrets.payu}
          setSecret={(val) => {
            setDirty(true);
            setSecrets((s) => ({ ...s, payu: val }));
          }}
          showSecret={showSecret.payu}
          toggleSecret={() => setShowSecret((s) => ({ ...s, payu: !s.payu }))}
        />

        {/* COD */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="font-medium">Cash On Delivery</div>
          <ToggleSwitch
            checked={gateways.cod.enabled}
            disabled={!editMode}
            onChange={(val) => {
              setDirty(true);
              setGateways((p) => ({ ...p, cod: { enabled: val } }));
            }}
          />
        </div>
      </div>
    </SettingsLayout>
  );
}

/* SIMPLE GATEWAY (Razorpay / Cashfree / PayU) */
function GatewaySimple({
  title,
  editMode,
  data,
  onChange,
  secret,
  setSecret,
  showSecret,
  toggleSecret,
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="font-medium">{title}</div>
        <ToggleSwitch
          checked={data.enabled}
          disabled={!editMode}
          onChange={(val) => onChange({ ...data, enabled: val })}
        />
      </div>

      <input
        type="text"
        value={data.key}
        disabled={!editMode}
        onChange={(e) => onChange({ ...data, key: e.target.value })}
        placeholder={`${title} Key`}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      {editMode && (
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={`${title} Secret`}
            className="w-full border rounded-lg px-3 py-2 text-sm pr-10"
          />
          <button
            type="button"
            onClick={toggleSecret}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}

/* PHONEPE SPECIAL */
function GatewayPhonePe({
  editMode,
  data,
  onChange,
  secret,
  setSecret,
  showSecret,
  toggleSecret,
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="font-medium">PhonePe</div>
        <ToggleSwitch
          checked={data.enabled}
          disabled={!editMode}
          onChange={(val) => onChange({ ...data, enabled: val })}
        />
      </div>

      <input
        type="text"
        value={data.merchant_id}
        disabled={!editMode}
        onChange={(e) => onChange({ ...data, merchant_id: e.target.value })}
        placeholder="Merchant ID"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <input
        type="text"
        value={data.client_id}
        disabled={!editMode}
        onChange={(e) => onChange({ ...data, client_id: e.target.value })}
        placeholder="Client ID"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <input
        type="text"
        value={data.client_version}
        disabled={!editMode}
        onChange={(e) => onChange({ ...data, client_version: e.target.value })}
        placeholder="Client Version"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      <input
        type="text"
        value={data.base_url}
        disabled={!editMode}
        onChange={(e) => onChange({ ...data, base_url: e.target.value })}
        placeholder="Base URL"
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />

      {editMode && (
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Client Secret"
            className="w-full border rounded-lg px-3 py-2 text-sm pr-10"
          />
          <button
            type="button"
            onClick={toggleSecret}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}

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
