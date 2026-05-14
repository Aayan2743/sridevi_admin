// src/pages/comp/EditStepVariation.jsx

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";

import { EditgenerateVariants } from "./EditgenerateVariants";
import EditVariantTable from "./EditVariantTable";
import EditVariantSelect from "./EditVariantSelect";

const EditStepVariation = forwardRef(
  ({ productId, existingCombinations = [] }, ref) => {
    const [variations, setVariations] = useState([]);
    const [selected, setSelected] = useState({});
    const [labels, setLabels] = useState([]); // UI only
    const [rows, setRows] = useState([]);
    const [rowsforEdit, setRowsforEdit] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastKeys, setLastKeys] = useState([]);

    /* ================= LOAD ADMIN VARIATIONS ================= */
    useEffect(() => {
      const loadVariations = async () => {
        const res = await api.get("/dashboard/get-variations");
        const raw = res.data.data || [];

        const normalized = raw.map((v) => ({
          id: v.id,
          name: v.name,
          values: (v.variation_values || []).map((val) => ({
            id: val.id,
            value: val.value,
          })),
        }));

        setVariations(normalized);

        const init = {};
        normalized.forEach((v) => (init[v.id] = []));
        setSelected(init);
      };

      loadVariations();
    }, []);

    /* ================= PREFILL FROM EXISTING COMBINATIONS ================= */
    useEffect(() => {
      if (!existingCombinations.length || !variations.length) return;

      const sel = {};
      const rowMap = {};

      variations.forEach((v) => {
        sel[v.id] = [];
      });

      // 🔥 build rowMap using VALUE IDS
      existingCombinations.forEach((combo) => {
        const key = combo.combination_values
          .map((cv) => cv.value.id)
          .sort()
          .join("_");

        combo.combination_values.forEach((cv) => {
          sel[cv.value.variation_id].push({
            id: cv.value.id,
            value: cv.value.value,
          });
        });

        rowMap[key] = {
          id: combo.id,
          sku: combo.sku || "",
          price: combo.extra_price || "",
          qty: combo.quantity || "",
          low_qty: combo.low_quantity || "",
          images: combo.images?.map((img) => img.image_url) || [],
        };
      });

      Object.keys(sel).forEach((k) => {
        sel[k] = Array.from(new Map(sel[k].map((v) => [v.id, v])).values());
      });

      setSelected(sel);

      const combos = EditgenerateVariants(sel);

      const finalRows = combos.map((c) => ({
        id: rowMap[c.key]?.id || null,
        key: c.key,
        label: c.label,
        sku: rowMap[c.key]?.sku || "",
        price: rowMap[c.key]?.price || "",
        qty: rowMap[c.key]?.qty || "",
        low_qty: rowMap[c.key]?.low_qty || "",
        images: rowMap[c.key]?.images || [],
      }));

      console.log("sssssssss", finalRows);
      setRowsforEdit(finalRows);

      setRows(finalRows);

      setLabels(combos.map((c) => c.label)); // ✅ strings only
    }, [existingCombinations, variations]);

    /* ================= HANDLE SELECT ================= */
    const handleSelect = (variationId, values) => {
      setSelected((prev) => ({
        ...prev,
        [variationId]: values,
      }));
    };

    /* ================= REGENERATE VARIANTS ================= */

    // useEffect(() => {
    //   if (!rows.length) return;
    //   if (!variations.length) return;

    //   const active = variations.filter((v) => selected[v.id]?.length > 0);
    //   if (!active.length) return;

    //   const combos = EditgenerateVariants(selected);

    //   // setRows((prev) =>
    //   //   combos.map((c) => {
    //   //     const existing = prev.find((r) => String(r.key) === String(c.key));

    //   //     if (existing) {
    //   //       return existing; // 🔥 KEEP FILE OBJECTS
    //   //     }

    //   //     return {
    //   //       id: null,
    //   //       key: c.key,
    //   //       label: c.label,
    //   //       sku: "",
    //   //       price: "",
    //   //       qty: "",
    //   //       low_qty: "",
    //   //       images: [],
    //   //     };
    //   //   })
    //   // );
    //   setRows((prev) =>
    //     combos.map((c) => {
    //       const existing = prev.find((r) => String(r.key) === String(c.key));

    //       if (existing) {
    //         // 🔥 CLONE OBJECT to allow React to re-render
    //         return {
    //           ...existing,
    //           images: existing.images, // preserve File objects
    //         };
    //       }

    //       return {
    //         id: null,
    //         key: c.key,
    //         label: c.label,
    //         sku: "",
    //         price: "",
    //         qty: "",
    //         low_qty: "",
    //         images: [],
    //       };
    //     })
    //   );
    // }, [selected]);

 

    useEffect(() => {
      if (!variations.length) return;

      const active = variations.filter(
        (v) => selected[v.id] && selected[v.id].length > 0
      );

      if (!active.length) {
        setRows([]);
        setLabels([]);
        setLastKeys([]);
        return;
      }

      const combos = EditgenerateVariants(selected);
      const newKeys = combos.map((c) => c.key).join("|");

      // 🔥 PREVENT UNNECESSARY REGEN
      if (newKeys === lastKeys.join("|")) return;

      setLastKeys(combos.map((c) => c.key));

      setRows((prev) =>
        combos.map((c) => {
          const existing = prev.find((r) => r.key === c.key);

          return (
            existing || {
              id: null,
              key: c.key,
              label: c.label,
              sku: "",
              price: "",
              qty: "",
              low_qty: "",
              images: [],
            }
          );
        })
      );

      setLabels(combos.map((c) => c.label));
    }, [selected, variations]);

    /* ================= SAVE STEP ================= */
    // useImperativeHandle(ref, () => ({
    //   async saveStep() {
    //     if (!productId) return false;

    //     try {
    //       setLoading(true);

    //       const payload = rows.map((row) => ({
    //         id: row.id,
    //         variation_value_ids: row.key.split("_").map(Number),
    //         sku: row.sku || null,
    //         extra_price: row.price || 0,
    //         quantity: row.qty || 0,
    //         low_quantity: row.low_qty || 0,
    //       }));

    //       await api.post(`/dashboard/product/sync-variations/${productId}`, {
    //         variants: payload,
    //       });

    //       return true;
    //     } catch (err) {
    //       console.error(err);
    //       alert("Failed to save variations");
    //       return false;
    //     } finally {
    //       setLoading(false);
    //     }
    //   },
    // }));

    useImperativeHandle(ref, () => ({
      async saveStep() {
        if (!productId) return false;

        try {
          setLoading(true);

          const formData = new FormData();
          console.log("rowwwwww", rows);

          rows.forEach((row, index) => {
            // BASIC DATA
            formData.append(`variants[${index}][id]`, row.id || "");
            formData.append(
              `variants[${index}][variation_value_ids]`,
              JSON.stringify(
                row.variation_value_ids || row.key.split("_").map(Number)
              )
            );
            formData.append(`variants[${index}][sku]`, row.sku || "");
            formData.append(`variants[${index}][extra_price]`, row.price || 0);
            formData.append(`variants[${index}][quantity]`, row.qty || 0);
            formData.append(
              `variants[${index}][low_quantity]`,
              row.low_qty || 0
            );

            row.images
              ?.filter((img) => img instanceof File) // 🔥 ONLY NEW FILES
              .forEach((file) => {
                formData.append(`variants[${index}][images][]`, file);
              });
          });

          // ❌ DO NOT SET CONTENT-TYPE HEADER
          await api.post(
            `/dashboard/product/sync-variations/${productId}`,
            formData
          );

          console.log("270", formData);

          return true;
        } catch (err) {
          console.error(err);
          alert("Failed to save variations");
          return false;
        } finally {
          setLoading(false);
        }
      },
    }));

    /* ================= UI ================= */
    return (
      <div className="space-y-6">
        <h3 className="font-semibold">Product Variants</h3>

        {variations.map((v) => (
          <EditVariantSelect
            key={v.id}
            label={v.name}
            options={v.values}
            selected={selected[v.id] || []}
            onChange={(vals) => handleSelect(v.id, vals)}
          />
        ))}

        {labels.length > 0 && (
          <EditVariantTable variants={labels} data={rows} setData={setRows} />
        )}

        {loading && <p className="text-sm text-blue-600">Saving variants...</p>}
      </div>
    );
  }
);

export default EditStepVariation;
