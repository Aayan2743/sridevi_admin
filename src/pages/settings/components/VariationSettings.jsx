import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import api from "../../../api/axios";
import BulkAddVariation from "../../BulkAddVariation";
import { useAuth } from "../../../auth/AuthContext";
import AccessDenied from "../../components/AccessDenied";

export default function VariationSettings() {
    const { can,permissions } = useAuth();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bulkVariation, setBulkVariation] = useState(null);

  /* ================= LOAD VARIATIONS ================= */
  // const loadVariations = async () => {

  const loadVariations = async () => {
    try {
      const res = await api.get("/admin-dashboard/get-variations");

      const normalized = (res.data.data || []).map((v) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        values: (v.values || []).map((val) =>
          v.type === "color"
            ? {
                id: val.id,
                label: val.value,
                code: val.color_code || "#000000",
              }
            : {
                id: val.id,
                value: val.value,
              },
        ),
      }));

      setVariations(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVariations();
  }, []);

  /* ================= VARIATION CRUD ================= */
  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        name: "",
        type: "text",
        values: [],
      },
    ]);
  };

  const updateVariation = (id, field, value) => {
    setVariations((prev) =>
      prev.map((v) =>
        (v.id || v.tempId) === id ? { ...v, [field]: value } : v,
      ),
    );
  };

  const removeVariation = async (variation) => {
    if (variation.id) {
      await api.delete(`/admin-dashboard/delete-variations/${variation.id}`);
    }

    setVariations((prev) =>
      prev.filter(
        (v) => (v.id || v.tempId) !== (variation.id || variation.tempId),
      ),
    );
  };

  /* ================= VALUES CRUD ================= */
  const addValue = (variationId, type) => {
    setVariations((prev) =>
      prev.map((v) =>
        (v.id || v.tempId) === variationId
          ? {
              ...v,
              values:
                type === "color"
                  ? [...v.values, { id: null, label: "", code: "#000000" }]
                  : [...v.values, { id: null, value: "" }],
            }
          : v,
      ),
    );
  };

  const updateValue = (variationId, index, field, value) => {
    setVariations((prev) =>
      prev.map((v) =>
        (v.id || v.tempId) === variationId
          ? {
              ...v,
              values: v.values.map((val, i) =>
                i === index ? { ...val, [field]: value } : val,
              ),
            }
          : v,
      ),
    );
  };

  const removeValue = async (variation, index) => {
    const value = variation.values[index];

    if (value?.id) {
      await api.delete(`/admin-dashboard/delete-variation-value/${value.id}`);
    }

    setVariations((prev) =>
      prev.map((v) =>
        (v.id || v.tempId) === (variation.id || variation.tempId)
          ? {
              ...v,
              values: v.values.filter((_, i) => i !== index),
            }
          : v,
      ),
    );
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setLoading(true);

      for (const variation of variations) {
        let variationId = variation.id;

        if (!variationId) {
          const res = await api.post("/admin-dashboard/add-variation", {
            name: variation.name,
            type: variation.type,
          });
          variationId = res.data.data.id;
          variation.id = variationId;
        } else {
          await api.put(`/admin-dashboard/update-variations/${variationId}`, {
            name: variation.name,
            type: variation.type,
          });
        }

        for (const val of variation.values) {
          if (variation.type === "text") {
            if (!val.value) continue;

            if (!val.id) {
              const res = await api.post(
                `/admin-dashboard/add-variation-value/${variationId}`,
                { value: val.value },
              );
              val.id = res.data.data.id;
            } else {
              await api.put(
                `/admin-dashboard/update-variation-value/${val.id}`,
                {
                  value: val.value,
                },
              );
            }
          }

          if (variation.type === "color") {
            if (!val.label) continue;

            if (!val.id) {
              const res = await api.post(
                `/admin-dashboard/add-variation-value/${variationId}`,
                {
                  value: val.label,
                  color_code: val.code,
                },
              );
              val.id = res.data.data.id;
            } else {
              await api.put(
                `/admin-dashboard/update-variation-value/${val.id}`,
                {
                  value: val.label,
                  color_code: val.code,
                },
              );
            }
          }
        }
      }

      alert("Variations saved successfully");
      loadVariations();
    }
    //  catch (err) {
    //   alert("Save failed");
    // } 

catch (err) {
  if (err.response?.data?.errors) {
    alert(err.response.data.errors);
  } else {
    alert("Save failed");
  }
}
    
    
    finally {
      setLoading(false);
    }
  };

     if (!can("settings.variationsettings")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }

  /* ================= UI ================= */
  return (
    <SettingsLayout>
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Variation Settings
            </h2>
            <p className="text-sm text-gray-500">
              Manage product variations and values
            </p>
          </div>

          <button
            onClick={addVariation}
            className="px-4 py-2 rounded-lg border text-sm
            hover:bg-gray-50 transition"
          >
            + Add Variation
          </button>
        </div>

        {/* VARIATIONS */}
        {variations.map((variation) => {
          const vId = variation.id || variation.tempId;

          return (
            <div key={vId} className="border rounded-xl p-4 space-y-4">
              {/* VAR HEADER */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <input
                  value={variation.name}
                  onChange={(e) => updateVariation(vId, "name", e.target.value)}
                  placeholder="Variation name (e.g. Size)"
                  className="input col-span-5"
                />

                <select
                  value={variation.type}
                  onChange={(e) => updateVariation(vId, "type", e.target.value)}
                  className="input col-span-3"
                >
                  <option value="text">Text</option>
                  <option value="color">Color</option>
                </select>

                <div className="col-span-4 text-right">
                  <button
                    onClick={() => removeVariation(variation)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

             <div className="flex gap-4">
  <button
    onClick={() => addValue(vId, variation.type)}
    className="text-sm text-indigo-600 hover:underline"
  >
    + Add Value
  </button>

  <button
    onClick={() => setBulkVariation(vId)}
    className="text-sm text-green-600 hover:underline"
  >
    + Bulk Add
  </button>
</div>

              {/* VALUES */}
              <div className="space-y-3">
                {variation.values.map((val, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    {variation.type === "color" ? (
                      <>
                        <input
                          value={val.label}
                          onChange={(e) =>
                            updateValue(vId, index, "label", e.target.value)
                          }
                          placeholder="Color name"
                          className="input col-span-4"
                        />

                        <input
                          type="color"
                          value={val.code}
                          onChange={(e) =>
                            updateValue(vId, index, "code", e.target.value)
                          }
                          className="col-span-2 h-10 rounded-lg border"
                        />

                        <input
                          value={val.code}
                          onChange={(e) =>
                            updateValue(vId, index, "code", e.target.value)
                          }
                          className="input col-span-3"
                        />
                      </>
                    ) : (
                      <input
                        value={val.value}
                        onChange={(e) =>
                          updateValue(vId, index, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="input col-span-9"
                      />
                    )}

                    <button
                      onClick={() => removeValue(variation, index)}
                      className="col-span-3 text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addValue(vId, variation.type)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  + Add Value
                </button>
              </div>
            </div>
          );
        })}
        

        {/* FOOTER */}
        <div className="flex justify-end">
          <button
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white
            hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save Variations"}
          </button>
        </div>
      </div>

{bulkVariation && (
  <BulkAddVariation
    variationId={bulkVariation}
    reload={loadVariations}
    onClose={() => setBulkVariation(null)}
  />
)}
      
    </SettingsLayout>
  );
}
