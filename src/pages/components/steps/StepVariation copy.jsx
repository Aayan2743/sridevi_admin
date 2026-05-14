import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";

import VariantSelect from "./VariantSelect";
import VariantTable from "./VariantTable";
import { generateVariants } from "./generateVariants";

const StepVariation = forwardRef(({ productId }, ref) => {
  const [variations, setVariations] = useState([]);
  const [selected, setSelected] = useState({});
  const [variants, setVariants] = useState([]);
  const [variantData, setVariantData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD VARIATIONS ================= */

  useEffect(() => {
    api
      .get("/admin-dashboard/get-variations")
      .then((res) => {
        const raw = res.data.data || [];

        const normalized = raw.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          values: (v.values || []).map((val) => ({
            id: val.id,
            value: val.value,
            color_code: val.color_code,
          })),
        }));

        setVariations(normalized);

        const init = {};
        normalized.forEach((v) => (init[v.id] = []));
        setSelected(init);
      })
      .catch(() => alert("Failed to load variations"));
  }, []);

  /* ================= HANDLE SELECT ================= */

  const handleChange = (variationId, values) => {
    setSelected((prev) => ({
      ...prev,
      [variationId]: values,
    }));
  };

  /* ================= GENERATE VARIANTS ================= */

  useEffect(() => {
    const active = variations.filter((v) => selected[v.id]?.length > 0);

    if (!active.length) {
      setVariants([]);
      setVariantData([]);
      return;
    }

    const input = {};
    active.forEach((v) => {
      input[v.name] = selected[v.id].map((val) => val.value);
    });

    const combos = generateVariants(input);

    setVariants(combos);
    setVariantData((prev) => combos.map((_, i) => prev[i] || {}));
  }, [selected, variations]);

  /* ================= SAVE STEP (API INTEGRATION) ================= */

  

  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        alert("Product not created");
        return false;
      }

      if (!variants.length) return true;

      try {
        setLoading(true);

        // 1️⃣ BUILD VARIANTS PAYLOAD
        const payload = variants.map((label, i) => ({
          variation_value_ids: Object.values(selected)
            .flat()
            .filter((v) => label.includes(v.value))
            .map((v) => v.id),

          sku: variantData[i]?.sku || null,
          purchase_price: Number(variantData[i]?.purchase_price || 0),
          // extra_price: Number(variantData[i]?.price || 0),
          sell_price: Number(variantData[i]?.price || 0),
          discount: Number(variantData[i]?.discount || 0),
          quantity: Number(variantData[i]?.qty || 0),
          low_quantity: Number(variantData[i]?.low_qty || 0),
        }));

        // 2️⃣ FORM DATA (JSON + IMAGES)
        const fd = new FormData();
        fd.append("variants", JSON.stringify(payload));

        variantData.forEach((row, index) => {
          row?.images?.forEach((img) => {
            fd.append(`variant_images[${index}][]`, img);
          });
        });

        // 3️⃣ SINGLE API CALL
        await api.post(
          `/admin-dashboard/product/create-variation/${productId}`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        return true;
      } catch (err) {
        console.error(err);
        alert("Failed to save variants");
        return false;
      } finally {
        setLoading(false);
      }
    },
  }));

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Product Variations
          </h3>
          <p className="text-sm text-gray-500">
            Select values to generate variants
          </p>
        </div>

        <a
          href="/dashboard/settings/variations"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
        >
          + Add Variation
        </a>
      </div>

      {/* VARIATION SELECTS */}
      <div className="space-y-4">
        {variations.map((variation) => (
          <VariantSelect
            key={variation.id}
            label={variation.name}
            options={variation.values || []}
            selected={selected[variation.id] || []}
            onChange={(vals) => handleChange(variation.id, vals)}
            disabled={!variation.values?.length}
          />
        ))}
      </div>

      {/* VARIANT TABLE */}
      {variants.length > 0 && (
        <div className="border rounded-xl p-4">
          <VariantTable
            variants={variants}
            data={variantData}
            setData={setVariantData}
          />
        </div>
      )}

      {loading && <p className="text-sm text-indigo-600">Saving variants…</p>}
    </div>
  );
});

export default StepVariation;
