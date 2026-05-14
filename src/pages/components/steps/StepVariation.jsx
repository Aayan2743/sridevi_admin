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
  const activeVariationCount = Object.values(selected).filter(
    (values) => values?.length > 0,
  ).length;
  const selectedValueCount = Object.values(selected).reduce(
    (total, values) => total + (values?.length || 0),
    0,
  );

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
    // setVariantData((prev) => combos.map((_, i) => prev[i] || {}));

    setVariantData((prev) =>
      combos.map((_, i) => ({
        is_returnable: 1, // default ON
        ...prev[i],
      }))
    );
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
          is_returnable: Number(variantData[i]?.is_returnable ?? 1),

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
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50" />

      <div className="relative space-y-6 p-6 md:p-7">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
              Variant builder
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Product Variations
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Pick the attributes you want to sell, generate all combinations,
                and fill stock, pricing, and images for each variant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
            <InfoTile
              label="Groups"
              value={String(activeVariationCount).padStart(2, "0")}
            />
            <InfoTile
              label="Values"
              value={String(selectedValueCount).padStart(2, "0")}
            />
            <InfoTile
              label="Variants"
              value={String(variants.length).padStart(2, "0")}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-800">
                  Select Variation Values
                </h4>
                <p className="text-sm text-slate-500">
                  Choose available sizes, colors, or other attributes to build
                  your sellable combinations.
                </p>
              </div>

              <a
                href="/dashboard/settings/variations"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                + Add Variation
              </a>
            </div>

            {variations.length > 0 ? (
              <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="rounded-[22px] border border-slate-200 bg-white p-1 shadow-sm"
                  >
                    <VariantSelect
                      label={variation.name}
                      options={variation.values || []}
                      selected={selected[variation.id] || []}
                      onChange={(vals) => handleChange(variation.id, vals)}
                      disabled={!variation.values?.length}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No variations available yet
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Create variation groups in settings, then return here to build
                  your product combinations.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-800">
              How this works
            </h4>
            <div className="mt-4 space-y-3">
              <GuideRow
                step="01"
                title="Choose attributes"
                description="Select the values customers can actually buy for this product."
              />
              <GuideRow
                step="02"
                title="Review combinations"
                description="Each selected value is combined automatically into variant rows."
              />
              <GuideRow
                step="03"
                title="Complete details"
                description="Add SKU, pricing, stock, return settings, and variant photos."
              />
            </div>

            <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
              <p className="text-sm font-semibold text-violet-800">
                Quick summary
              </p>
              <p className="mt-1 text-sm text-violet-700">
                {variants.length > 0
                  ? `${variants.length} variant combination${variants.length > 1 ? "s are" : " is"} ready to configure.`
                  : "Select at least one variation value to generate combinations."}
              </p>
            </div>
          </div>
        </div>

        {/* VARIANT TABLE */}
        {variants.length > 0 && (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-800">
                  Generated Variants
                </h4>
                <p className="text-sm text-slate-500">
                  Complete each row carefully so every product option is ready to
                  sell.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {variants.length} row{variants.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl">
              <VariantTable
                variants={variants}
                data={variantData}
                setData={setVariantData}
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Saving variants...
          </div>
        )}
      </div>
    </div>
  );
});

export default StepVariation;

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function GuideRow({ step, title, description }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
        {step}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
