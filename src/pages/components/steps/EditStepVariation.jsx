import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";
import { EditgenerateVariants } from "./EditgenerateVariants";
import EditVariantSelect from "./EditVariantSelect";
import EditVariantTable from "./EditVariantTable";

const EditStepVariation = forwardRef(
  ({ productId, existingCombinations = [] }, ref) => {
    const [tableData, setTableData] = useState([]); // rows for table

    const [variations, setVariations] = useState([]);
    const [selected, setSelected] = useState({});
    const [rows, setRows] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [initialized, setInitialized] = useState(false);

    const [skipNextRegen, setSkipNextRegen] = useState(false);
    const activeVariationCount = Object.values(selected).filter(
      (values) => Array.isArray(values) && values.length > 0,
    ).length;
    const selectedValueCount = Object.values(selected).reduce(
      (total, values) => total + (Array.isArray(values) ? values.length : 0),
      0,
    );

    /* ================= PREFILL EXISTING ================= */

    useEffect(() => {
      if (!existingCombinations.length || !variations.length) return;

      const sel = {};
      const rowMap = {};

      // Initialize selection map for all variations
      variations.forEach((v) => {
        sel[v.id] = [];
      });

      existingCombinations.forEach((combo) => {

        if (!Array.isArray(combo.combination_values)) return;

        // 🔥 IMPORTANT: numeric sort for key consistency
        const ids = combo.combination_values
          .map((cv) => Number(cv?.value?.id))
          .filter(Boolean)
          .sort((a, b) => a - b);

        if (!ids.length) return;

        const key = ids.join("_"); // e.g. "4" or "2_5"

        // Build selected values per variation
        combo.combination_values.forEach((cv) => {
          const variationId = cv.value.variation_id;

          // Initialize if not exists
          if (!sel[variationId]) {
            sel[variationId] = [];
          }

          sel[variationId].push({
            id: cv.value.id,
            value: cv.value.value,
          });
        });

        // Map existing row data by key
        rowMap[key] = {
          key,
          id: combo.id,
          label: combo.combination_values.map((v) => v.value.value).join(" / "),
          sku: combo.sku ?? "",
          purchase_price: combo.purchase_price ?? "",
          price: combo.extra_price ?? "",
          discount: combo.discount ?? "",
          qty: combo.quantity ?? "",
          low_qty: combo.low_quantity ?? "",
          images: combo.images ?? [],
          is_returnable: combo.is_returnable ?? 1,
          imagesTouched: false,
        };
      });

      // Remove duplicate selected values (safety)
      Object.keys(sel).forEach((k) => {
        sel[k] = Array.from(new Map(sel[k].map((v) => [v.id, v])).values());
      });

      // Set selected variations (this WILL trigger regenerate effect)
      setSelected(sel);

      // Generate variant combinations from selected
      const combos = EditgenerateVariants(sel);

      // Prefill rows using rowMap
      // setRows(
      //   combos.map((c) => ({
      //     key: c.key,
      //     label: c.label,
      //     ...(rowMap[c.key] || {}), // 🔥 safe spread
      //   })),
      // );

      setRows(
        combos.map((c) => ({
          key: c.key,
          label: c.label,
          ...(rowMap[c.key] || {}),
        })),
      );

      setLabels(combos.map((c) => c.label));

      // 🔥 Prevent overwrite by regenerate effect
      setSkipNextRegen(true);
      // setInitialized(true);
    }, [existingCombinations, variations]);

    /* ================= REGENERATE ON SELECT ================= */

    useEffect(() => {
      if (!variations.length) return;

      const groups = Object.values(selected).filter(
        (vals) => Array.isArray(vals) && vals.length,
      );

      // 🔥 DO NOT CLEAR ROWS ON EDIT LOAD
      if (!groups.length) {
        if (existingCombinations.length === 0) {
          setRows([]);
          setLabels([]);
        }
        return;
      }

      const combos = EditgenerateVariants(selected);

      setRows((prev) =>
        combos.map((c) => {
          const existing = prev.find((r) => r.key === c.key);

          return existing
            ? { ...existing, label: c.label }
            : {
                key: c.key,
                label: c.label,
                sku: "",
                purchase_price: "",
                price: "",
                discount: "",
                qty: "",
                low_qty: "",
                images: [],
                imagesTouched: false,
              };
        }),
      );

      setLabels(combos.map((c) => c.label));
    }, [selected, variations, existingCombinations]);

    /* ================= LOAD VARIATIONS ================= */
    useEffect(() => {
      (async () => {
        try {
          const res = await api.get("/admin-dashboard/get-variations");
          const raw = Array.isArray(res.data?.data) ? res.data.data : [];

          const normalized = raw.map((v) => ({
            id: v.id,
            name: v.name,
            type: v.type || "text",
            values: Array.isArray(v.values)
              ? v.values.map((val) => ({
                  id: val.id,
                  value: val.value,
                  color_code: val.color_code || null,
                }))
              : [],
          }));

          setVariations(normalized);

          const init = {};
          normalized.forEach((v) => (init[v.id] = []));
          setSelected(init);
        } catch (err) {
          console.error("Failed to load variations:", err);
        }
      })();
    }, []);
    /* ================= IMAGE HANDLERS ================= */
    const addImages = (rowIndex, files) => {
      setRows((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? {
                ...row,
                images: [...(row.images || []), ...files],
                imagesTouched: true,
              }
            : row,
        ),
      );
    };

    const removeImage = (rowIndex, imgIndex) => {
      setRows((prev) =>
        prev.map((row, i) =>
          i === rowIndex
            ? {
                ...row,
                images: row.images.filter((_, j) => j !== imgIndex),
                imagesTouched: true,
              }
            : row,
        ),
      );
    };

    /* ================= SAVE ================= */
    useImperativeHandle(ref, () => ({
      async saveStep() {
        try {
          setLoading(true);

          const fd = new FormData();

          rows.forEach((row, index) => {
            fd.append(`variants[${index}][id]`, row.id || "");
            fd.append(`variants[${index}][sku]`, row.sku || "");
            fd.append(
              `variants[${index}][purchase_price]`,
              row.purchase_price || 0,
            );
            fd.append(`variants[${index}][extra_price]`, row.price || 0);
            fd.append(`variants[${index}][discount]`, row.discount || 0);
            fd.append(`variants[${index}][quantity]`, row.qty || 0);
            fd.append(`variants[${index}][low_quantity]`, row.low_qty || 0);

            fd.append(
            `variants[${index}][is_returnable]`,
            row.is_returnable ? 1 : 0
          );

            row.key
              .split("_")
              .forEach((id) =>
                fd.append(`variants[${index}][variation_value_ids][]`, id),
              );

            if (row.imagesTouched) {
              row.images
                .filter((img) => !(img instanceof File) && img.id)
                .forEach((img) =>
                  fd.append(`variants[${index}][keep_image_ids][]`, img.id),
                );

              row.images
                .filter((img) => img instanceof File)
                .forEach((file) =>
                  fd.append(`variants[${index}][images][]`, file),
                );
            }
          });

          await api.post(
            `/admin-dashboard/product/update-variation/${productId}`,
            fd,
          );

          return true;
        } finally {
          setLoading(false);
        }
      },
    }));

    return (
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50" />

        <div className="relative space-y-6 p-6 md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
                Edit variants
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Product Variations
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Update variation values, regenerate combinations, and adjust
                  pricing, stock, returnability, and images for each row.
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
                value={String(labels.length).padStart(2, "0")}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-slate-800">
                  Select Variation Values
                </h4>
                <p className="text-sm text-slate-500">
                  Adjust the values that belong to this product. Variant rows will
                  refresh automatically based on your selection.
                </p>
              </div>

              {variations.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Loading variations...
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Available variation groups will appear here shortly.
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                  {variations.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-[22px] border border-slate-200 bg-white p-1 shadow-sm"
                    >
                      <EditVariantSelect
                        label={v.name}
                        options={v.values || []}
                        selected={selected[v.id] || []}
                        onChange={(vals) =>
                          setSelected((p) => ({
                            ...p,
                            [v.id]: [...vals],
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-base font-semibold text-slate-800">
                Editing Guide
              </h4>
              <div className="mt-4 space-y-3">
                <GuideRow
                  step="01"
                  title="Adjust selections"
                  description="Add or remove values to control which variant combinations should exist."
                />
                <GuideRow
                  step="02"
                  title="Review regenerated rows"
                  description="Existing data is preserved where possible while new combinations are added."
                />
                <GuideRow
                  step="03"
                  title="Finalize row details"
                  description="Update pricing, stock, returnability, and media before saving."
                />
              </div>

              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
                <p className="text-sm font-semibold text-violet-800">
                  Quick summary
                </p>
                <p className="mt-1 text-sm text-violet-700">
                  {labels.length > 0
                    ? `${labels.length} variant combination${labels.length > 1 ? "s are" : " is"} ready to review.`
                    : "Select at least one variation value to show editable combinations."}
                </p>
              </div>
            </div>
          </div>

          {labels.length > 0 && (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-slate-800">
                    Generated Variants
                  </h4>
                  <p className="text-sm text-slate-500">
                    Review each row carefully and update variant details with confidence.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  {labels.length} row{labels.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-2xl">
                <EditVariantTable
                  variants={labels}
                  data={rows}
                  setData={setRows}
                  addImages={addImages}
                  removeImage={removeImage}
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Saving variations...
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default EditStepVariation;

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
