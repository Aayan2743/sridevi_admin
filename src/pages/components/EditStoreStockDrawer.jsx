import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { generateVariants } from "./steps/generateVariants";

/** @param {number} n */
function randomDigits(n) {
  let s = "";
  for (let i = 0; i < n; i += 1) s += Math.floor(Math.random() * 10);
  return s;
}

/**
 * 13-digit barcode (EAN-13 check digit). Prefix 200 = commonly used for in-house / store numbering.
 * UI-only until your API assigns official GTINs.
 */
function generateEan13Internal() {
  const body = `200${randomDigits(9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const d = Number(body[i]);
    sum += i % 2 === 0 ? d : d * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return `${body}${check}`;
}

function collectUsedBarcodes(rows) {
  const used = new Set();
  (rows || []).forEach((r) => {
    const t = String(r?.barcode || "").trim();
    if (t) used.add(t);
  });
  return used;
}

function nextUniqueBarcode(used) {
  for (let k = 0; k < 64; k += 1) {
    const b = generateEan13Internal();
    if (!used.has(b)) return b;
  }
  return generateEan13Internal();
}

function generateSkuCode() {
  const t = Date.now().toString(36).toUpperCase().slice(-6);
  return `SKU-${t}-${randomDigits(4)}`;
}

/** Normalize an image value (string URL, File, or object with url/image_url) to a plain URL string or File */
function extractImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") return img.trim() || null;
  if (img instanceof File) return img;
  if (typeof img === "object") {
    const url = img.url || img.image_url || img.path || img.src || "";
    return typeof url === "string" && url.trim() ? url.trim() : null;
  }
  return null;
}

/**
 * Rebuild pill selections from persisted variant labels ("A / B / C" in variation group order).
 */
function mapVariationListFromApi(rawVariations) {
  return (Array.isArray(rawVariations) ? rawVariations : [])
    .map((variation) => {
      const key =
        variation.name ||
        variation.key ||
        variation.title ||
        variation.variation_name ||
        "";
      const rawValues =
        variation.values ||
        variation.variation_values ||
        variation.options ||
        [];
      const values = (Array.isArray(rawValues) ? rawValues : [])
        .map((v) => {
          if (typeof v === "string") return v;
          return v?.value || v?.name || v?.variation_value || v?.label || "";
        })
        .filter(Boolean);
      return { key, values };
    })
    .filter((g) => g.key && g.values && g.values.length > 0);
}

function matchLabelPartsToGroups(label, groups) {
  const trimmed = String(label || "").trim();
  if (!trimmed || !groups?.length) return null;

  const split = trimmed.split(" / ").map((s) => s.trim());
  if (split.length === groups.length) {
    const ok = split.every((part, i) =>
      (groups[i].values || []).includes(part),
    );
    if (ok) return split;
  }

  const out = [];
  let rest = trimmed;
  for (const g of groups) {
    const vals = [...(g.values || [])].sort(
      (a, b) => String(b).length - String(a).length,
    );
    const hit = vals.find((v) => v && rest.startsWith(String(v)));
    if (!hit) return null;
    out.push(hit);
    rest = rest
      .slice(String(hit).length)
      .replace(/^\s*\/\s*/, "")
      .trim();
  }
  return out.length === groups.length && !rest ? out : null;
}

function buildSelectedVariationsFromVariantRows(groups, rows) {
  const init = {};
  (groups || []).forEach((g) => {
    init[g.key] = [];
  });
  if (!groups?.length || !rows?.length) return init;

  const buckets = groups.map(() => new Set());
  for (const row of rows) {
    const parts = matchLabelPartsToGroups(row?.label, groups);
    if (!parts) continue;
    parts.forEach((part, idx) => buckets[idx].add(part));
  }

  groups.forEach((g, idx) => {
    init[g.key] = Array.from(buckets[idx]);
  });
  return init;
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 " +
        (props.className || "")
      }
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={
        "min-h-[96px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 " +
        (props.className || "")
      }
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 " +
        (props.className || "")
      }
    />
  );
}

function MultiValuePills({ values, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => {
        const active = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            className={`h-10 rounded-2xl border px-4 text-sm font-semibold transition ${
              active
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

export default function EditStoreStockDrawer({
  open,
  onClose,
  onSaved,
  product,
}) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false); // 🔥 separate loading state for fetch

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    subcategoryId: "",
    sku: "",
    quantity: "",
    hsn: "",
    discount: "",
    gst: "",
    batchNo: "",
    expiry: "",
    supplier: "",
    notes: "",
    images: [], // File[] — product photos when no variant rows
  });
  const [categories, setCategories] = useState([]);
  const [variations, setVariations] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});

  const [variantRows, setVariantRows] = useState([]); // [{label, barcode, qty, costPrice, sellingPrice, discount (₹), hsn, images: File[]}]
  const variantFileRefs = useRef({});
  const productImagesRef = useRef(null);
  const dataLoadedRef = useRef(false); // 🔥 guard: only sync variants after API data is loaded
  const prevProductIdRef = useRef(null); // 🔥 guard: prevent re-fetch when parent re-renders with same product
  const blobUrlCacheRef = useRef(new Map()); // 🔥 cache blob URLs to avoid creating new ones on every render

  // 🔥 Helper: get stable preview URL for an image (File or string)
  const getImagePreview = (img) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    if (!(img instanceof File)) return null;
    const key = `${img.name}|${img.size}|${img.lastModified}`;
    if (blobUrlCacheRef.current.has(key)) {
      return blobUrlCacheRef.current.get(key);
    }
    const url = URL.createObjectURL(img);
    blobUrlCacheRef.current.set(key, url);
    return url;
  };

  // 🔥 Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    console.debug("Edit drawer: incoming product prop", product);
    if (!open || !product?.id) return;

    // 🔥 Only re-fetch if the product ID actually changed (not just object reference)
    if (prevProductIdRef.current === product.id && dataLoadedRef.current)
      return;
    prevProductIdRef.current = product.id;

    dataLoadedRef.current = false; // 🔥 reset guard on new open/product

    const fetchProductDetails = async () => {
      try {
        setLoading(true); // 🔥 use loading, not saving

        const [prodResult, varResult] = await Promise.allSettled([
          api.get(`/admin-dashboard/offline-store/get-product/${product.id}`),
          api.get("/admin-dashboard/get-variations"),
        ]);

        if (prodResult.status !== "fulfilled") {
          throw prodResult.reason;
        }

        const res = prodResult.value;
        const variationRes =
          varResult.status === "fulfilled"
            ? varResult.value
            : { data: { data: [] } };

        if (varResult.status !== "fulfilled") {
          console.warn("Edit drawer: get-variations failed", varResult.reason);
        }

        const productData = res?.data?.data;
        console.debug("Edit drawer: fetched productData", productData);

        if (!productData) return;

        const rawVariationList = Array.isArray(variationRes?.data?.data)
          ? variationRes.data.data
          : [];
        const mappedVariations = mapVariationListFromApi(rawVariationList);
        console.debug(
          "Edit drawer: mapped variations (with product)",
          mappedVariations,
        );

        setForm({
          name: productData?.name || "",
          categoryId: productData?.category_id || "",
          subcategoryId: productData?.subcategory_id || "",
          sku: productData?.sku || productData?.product_sku || "",

          quantity:
            productData?.store_stock ??
            productData?.quantity ??
            productData?.stock ??
            "",

          hsn: productData?.hsn_code || productData?.hsn || "",

          discount: productData?.discount || "",

          gst: productData?.gst_percentage || productData?.gst || "",

          batchNo: productData?.batch_no || productData?.batchNo || "",

          expiry: productData?.expiry_date || productData?.expiry || "",

          supplier: productData?.supplier || "",

          notes: productData?.notes || "",

          images: (
            productData?.image_urls ||
            productData?.image_url ||
            productData?.images ||
            []
          )
            .map(extractImageUrl)
            .filter(Boolean),
        });

        // accept multiple shapes for variants coming from different APIs
        let rawVariants = Array.isArray(productData?.variants)
          ? productData.variants
          : Array.isArray(productData?.variantCombinations)
            ? productData.variantCombinations
            : Array.isArray(productData?.variant_combinations)
              ? productData.variant_combinations
              : Array.isArray(productData?.variant_list)
                ? productData.variant_list
                : [];

        // fallback: if API returned no variants, try using the product prop (from listing)
        if (!rawVariants.length) {
          rawVariants =
            Array.isArray(product?.variants) && product.variants.length
              ? product.variants
              : Array.isArray(product?.variantCombinations) &&
                  product.variantCombinations.length
                ? product.variantCombinations
                : rawVariants;
        }

        const nextRows = rawVariants.map((v) => ({
          id: v.id || v.variant_id || v.product_variant_id,
          label:
            v.label ||
            (Array.isArray(v.variation_values)
              ? v.variation_values.join(" / ")
              : null) ||
            v.name ||
            v.title ||
            "",

          barcode: v.barcode || v.sku || v.variant_sku || "",

          qty: v.quantity ?? v.stock ?? v.qty ?? "",

          costPrice: (v.purchase_price ?? v.cost_price ?? v.cost) || "",

          sellingPrice:
            v.sell_price ?? v.sellPrice ?? v.price ?? v.final_price ?? "",

          discount: v.discount ?? "",

          hsn: v.hsn_code || v.hsn || "",

          images: (v.image_urls || v.image_url || v.images || [])
            .map(extractImageUrl)
            .filter(Boolean),
        }));

        const selectedFromRows = buildSelectedVariationsFromVariantRows(
          mappedVariations,
          nextRows,
        );

        setVariations(mappedVariations);
        setSelectedVariations(selectedFromRows);
        setVariantRows(nextRows);
        dataLoadedRef.current = true; // 🔥 mark data as loaded
      } catch (err) {
        console.error("Product details fetch error", err);

        toast.error("Failed to load product details");
      } finally {
        setLoading(false); // 🔥 use loading
      }
    };

    fetchProductDetails();
  }, [open, product]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const categoryRes = await api.get("/admin-dashboard/list-category-all");
        console.debug("Edit drawer: categories response", categoryRes?.data);

        setCategories(
          Array.isArray(categoryRes.data?.data) ? categoryRes.data.data : [],
        );
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    fetchData();
  }, [open]);

  useEffect(() => {
    setSelectedVariations((prev) => {
      const next = { ...prev };
      variations.forEach((group) => {
        if (!(group.key in next)) next[group.key] = [];
      });
      Object.keys(next).forEach((k) => {
        if (!variations.some((g) => g.key === k)) delete next[k];
      });
      return next;
    });
  }, [variations]);

  const mainCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null || c.parent_id === 0),
    [categories],
  );

  const subCategories = useMemo(
    () =>
      categories.filter((c) => String(c.parent_id) === String(form.categoryId)),
    [categories, form.categoryId],
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(form.categoryId)),
    [form.categoryId, categories],
  );

  useEffect(() => {
    setForm((p) => {
      if (!p.categoryId) return { ...p, subcategoryId: "" };
      const validSubcategory = subCategories.some(
        (sub) => String(sub.id) === String(p.subcategoryId),
      );
      return validSubcategory ? p : { ...p, subcategoryId: "" };
    });
  }, [form.categoryId, subCategories]);

  // const variants = useMemo(() => {
  //   const input = Object.fromEntries(
  //     Object.entries(selectedVariations).filter(
  //       ([, vals]) => (vals?.length || 0) > 0,
  //     ),
  //   );
  //   return generateVariants(input);
  // }, [selectedVariations]);

  // 🔥 Compute generated variant labels from selected pills ONLY
  // NO dependency on variantRows — breaks the circular loop
  const variants = useMemo(() => {
    const input = Object.fromEntries(
      Object.entries(selectedVariations).filter(
        ([, vals]) => (vals?.length || 0) > 0,
      ),
    );

    return generateVariants(input);
  }, [selectedVariations]);

  // 🔥 Sync variantRows with generated variants — only after data is loaded
  useEffect(() => {
    if (!dataLoadedRef.current) return; // 🔥 guard: don't run before API data arrives

    if (!variants.length) {
      // 🔥 Don't wipe rows when no pills selected — user may have non-variant product
      // Only wipe if there were previously variant rows AND user cleared all pills
      return;
    }

    setVariantRows((prev) => {
      const newLabels = new Set(
        variants.map((arr) =>
          Array.isArray(arr) ? arr.join(" / ") : String(arr),
        ),
      );

      // 🔥 Only add new rows for labels that don't exist yet
      // Keep existing rows with their data intact
      const existingMap = new Map(prev.map((r) => [r.label, r]));

      let changed = false;
      const result = variants.map((arr) => {
        const label = Array.isArray(arr) ? arr.join(" / ") : String(arr);
        const existing = existingMap.get(label);
        if (existing) return existing; // preserve user edits

        changed = true;
        return {
          label,
          barcode: "",
          qty: "",
          costPrice: "",
          sellingPrice: "",
          discount: "",
          hsn: "",
          images: [],
        };
      });

      // 🔥 Remove rows for labels that no longer exist in variants
      const filtered = result.filter((r) => newLabels.has(r.label));
      if (filtered.length !== prev.length) changed = true;

      return changed ? filtered : prev;
    });
  }, [variants]);

  // const canSave = useMemo(() => {
  //   const baseQty = Number(form.quantity);
  //   const baseQtyOk = Number.isFinite(baseQty) && baseQty > 0;
  //   const basicOk = Boolean(form.name.trim()) && Boolean(form.categoryId);

  //   const hsnLooksValid = (s) => {
  //     if (!s) return true;
  //     return (
  //       typeof s === "string" && s.trim().length >= 4 && /^\d+$/.test(s.trim())
  //     );
  //   };

  //   const discountRsOk = (val) => {
  //     if (val === "" || val == null) return true;
  //     const n = Number(val);
  //     return Number.isFinite(n) && n >= 0;
  //   };

  //   return basicOk && variantsOk;
  // }, [form, variantRows]);

  // const canSave = useMemo(() => {
  //   const basicOk = Boolean(form.name?.trim()) && Boolean(form.categoryId);

  //   // Variant validation
  //   if (variantRows.length > 0) {
  //     return (
  //       basicOk &&
  //       variantRows.every((row) => {
  //         return (
  //           Number(row.qty || 0) > 0 &&
  //           Number(row.sellingPrice || 0) > 0 &&
  //           row.hsn &&
  //           row.hsn.toString().trim().length >= 4
  //         );
  //       })
  //     );
  //   }

  //   // Non variant validation
  //   return basicOk && Number(form.quantity || 0) > 0 && Boolean(form.hsn);
  // }, [form, variantRows]);

  const canSave = useMemo(() => {
    const basicOk = Boolean(form.name?.trim()) && Boolean(form.categoryId);

    // WITH VARIANTS
    if (variantRows.length > 0) {
      return basicOk && variantRows.some((row) => Number(row.qty || 0) > 0);
    }

    // WITHOUT VARIANTS
    return basicOk && Number(form.quantity || 0) > 0;
  }, [form, variantRows]);

  if (!open) return null;

  const handleSave = async () => {
    if (saving || !canSave) return;

    const categoryId = form.subcategoryId || form.categoryId;
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    const productId = product?.id;
    if (!productId) {
      toast.error("Missing product id");
      return;
    }

    const payload = {
      name: form.name,
      category_id: categoryId,
      sku: form.sku || null,
      quantity: Number(form.quantity || 0),
      store_stock: Number(form.quantity || 0),
      stock: Number(form.quantity || 0),

      hsn_code: form.hsn || null,
      discount: Number(form.discount || 0),
      gst_percentage: Number(form.gst || 0),

      batch_no: form.batchNo || null,
      expiry_date: form.expiry
        ? new Date(form.expiry).toISOString().split("T")[0]
        : null,
      supplier: form.supplier || null,
      notes: form.notes || null,

      is_pos: 1,
      stock_type: "store",

      variants: variantRows.map((row) => {
        const v = {
          label: row.label,
          sku: row.barcode || row.label,

          quantity: Number(row.qty || 0),
          stock: Number(row.qty || 0),

          purchase_price: Number(row.costPrice || 0),
          sell_price: Number(row.sellingPrice || 0),

          discount: Number(row.discount || 0),
          gst_percentage: Number(form.gst || 0),

          hsn_code: row.hsn || null,
        };
        if (row.id != null && String(row.id).trim() !== "") {
          v.id = row.id;
        }
        return v;
      }),
    };

    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      if (key !== "variants") {
        formData.append(key, payload[key]);
      }
    });

    payload.variants.forEach((variant, index) => {
      Object.keys(variant).forEach((key) => {
        formData.append(`variants[${index}][${key}]`, variant[key] ?? "");
      });
    });

    if (form.images?.length) {
      form.images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images[]", img);
        } else if (typeof img === "string" && img.trim()) {
          formData.append("existing_images[]", img.trim());
        }
      });
    }

    variantRows.forEach((variant, index) => {
      if (variant.images?.length) {
        variant.images.forEach((img) => {
          if (img instanceof File) {
            formData.append(`variant_images[${index}][]`, img);
          } else if (typeof img === "string" && img.trim()) {
            formData.append(`existing_variant_images[${index}][]`, img.trim());
          }
        });
      }
    });

    try {
      setSaving(true);

      const response = await api.post(
        `/admin-dashboard/offline-store/update-product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(
        response?.data?.message || "Store stock updated successfully",
      );
      onSaved?.(response?.data);
      onClose?.();
    } catch (err) {
      console.error("Failed to save store stock", err);
      toast.error(
        err?.response?.data?.message || "Failed to update store stock",
      );
    } finally {
      setSaving(false);
    }
  };

  const addVariantImages = (label, files) => {
    const next = Array.from(files || []).filter(Boolean);
    if (!next.length) return;
    setVariantRows((prev) =>
      prev.map((x) =>
        x.label === label
          ? { ...x, images: [...(x.images || []), ...next] }
          : x,
      ),
    );
  };

  const removeVariantImage = (label, imgIndex) => {
    setVariantRows((prev) =>
      prev.map((x) => {
        if (x.label !== label) return x;
        const imgs = [...(x.images || [])];
        imgs.splice(imgIndex, 1);
        return { ...x, images: imgs };
      }),
    );
  };

  const addProductImages = (files) => {
    const next = Array.from(files || []).filter(Boolean);
    if (!next.length) return;
    setForm((p) => ({ ...p, images: [...(p.images || []), ...next] }));
  };

  const removeProductImage = (imgIndex) => {
    setForm((p) => {
      const imgs = [...(p.images || [])];
      imgs.splice(imgIndex, 1);
      return { ...p, images: imgs };
    });
  };

  const generateProductSku = () => {
    setForm((p) => ({ ...p, sku: generateSkuCode() }));
    toast.info("SKU generated");
  };

  const generateVariantBarcode = (label) => {
    setVariantRows((prev) => {
      const used = collectUsedBarcodes(prev);
      const cur = prev.find((x) => x.label === label);
      if (String(cur?.barcode || "").trim())
        used.delete(String(cur.barcode).trim());
      const b = nextUniqueBarcode(used);
      return prev.map((x) => (x.label === label ? { ...x, barcode: b } : x));
    });
  };

  const fillMissingVariantBarcodes = () => {
    setVariantRows((prev) => {
      const used = collectUsedBarcodes(prev);
      return prev.map((row) => {
        if (String(row.barcode || "").trim()) return row;
        const b = nextUniqueBarcode(used);
        used.add(b);
        return { ...row, barcode: b };
      });
    });
    toast.success("Barcodes filled for empty rows");
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50 to-cyan-50">
        {/* single scroll surface: min-h-0 + overflow-y-auto fixes flex children not scrolling */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 pb-8 sm:px-6 sm:py-5 md:px-10 md:py-6 md:pb-10">
          <div className="w-full">
            <div className="flex flex-col rounded-none border border-slate-200/80 bg-white shadow-sm sm:rounded-2xl lg:rounded-3xl lg:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600" />

              <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 px-5 py-5 backdrop-blur-md md:px-8 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
                      Store inventory
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                      Edit Store Stock
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Update product details, stock and pricing information.
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="bg-white px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:px-12 xl:px-16">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Loading product details...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/60 p-5">
                      <p className="mb-4 text-sm font-semibold text-slate-800">
                        Product details
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Product name" hint="required">
                          <Input
                            value={form.name}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="Enter product name"
                          />
                        </Field>

                        <Field label="Category" hint="required">
                          <Select
                            value={form.categoryId}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                categoryId: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select category</option>
                            {mainCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </Field>

                        <Field label="Sub category" hint="optional">
                          <Select
                            value={form.subcategoryId}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                subcategoryId: e.target.value,
                              }))
                            }
                            disabled={!selectedCategory}
                          >
                            <option value="">Select sub category</option>
                            {categories
                              .filter(
                                (c) =>
                                  String(c.parent_id) ===
                                  String(form.categoryId),
                              )
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </Select>
                        </Field>

                        <Field label="Supplier" hint="optional">
                          <Input
                            value={form.supplier}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                supplier: e.target.value,
                              }))
                            }
                            placeholder="e.g. ABC Traders"
                          />
                        </Field>

                        <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-12">
                          {/* SKU */}
                          <div className="md:col-span-8">
                            <Field label="SKU" hint="optional · auto-generate">
                              <div className="flex gap-2">
                                <Input
                                  className="min-w-0 flex-1"
                                  value={form.sku}
                                  onChange={(e) =>
                                    setForm((p) => ({
                                      ...p,
                                      sku: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g. SKU-ABC1234"
                                />

                                <button
                                  type="button"
                                  onClick={generateProductSku}
                                  className="shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                >
                                  Generate
                                </button>
                              </div>
                            </Field>
                          </div>

                          {/* GST */}
                          <div className="md:col-span-4">
                            <Field label="GST %" hint="product level">
                              <Input
                                value={form.gst}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    gst: e.target.value,
                                  }))
                                }
                                inputMode="decimal"
                                placeholder="e.g. 18"
                              />
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Variations (optional)
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Select values to generate variants. If you skip, you
                            can add stock for the product directly.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVariations(() => {
                              const init = {};
                              variations.forEach((g) => (init[g.key] = []));
                              return init;
                            });
                          }}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Clear variations
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        {variations.map((group) => (
                          <div
                            key={group.key}
                            className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {group.key}
                            </p>
                            <div className="mt-3">
                              <MultiValuePills
                                values={group.values}
                                selected={selectedVariations[group.key] || []}
                                onToggle={(v) => {
                                  setSelectedVariations((prev) => {
                                    const current = prev[group.key] || [];
                                    const next = current.includes(v)
                                      ? current.filter((x) => x !== v)
                                      : [...current, v];
                                    return { ...prev, [group.key]: next };
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-slate-800">
                        Stock & pricing
                      </p>

                      <div className="mt-4 space-y-4">
                        {variantRows.length ? (
                          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  Variant stock & pricing
                                </p>
                                <span className="text-xs text-slate-500">
                                  {variantRows.length} variant
                                  {variantRows.length > 1 ? "s" : ""}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={fillMissingVariantBarcodes}
                                className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 sm:w-auto"
                              >
                                Generate missing barcodes
                              </button>
                            </div>
                            <div className="max-h-[440px] overflow-auto rounded-2xl bg-white">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50 text-slate-500">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                      Variant
                                    </th>
                                    <th className="min-w-[10.5rem] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                      Barcode
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                      Cost
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                      Sell
                                    </th>
                                    <th className="min-w-[5.5rem] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                      Disc (₹)
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                      HSN
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                      Qty
                                    </th>
                                    <th className="min-w-[9rem] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                      Photos
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variantRows.map((r) => (
                                    <tr
                                      key={r.label}
                                      className="border-t border-slate-100"
                                    >
                                      <td className="px-4 py-3 font-medium text-slate-800">
                                        {r.label}
                                      </td>
                                      <td className="min-w-[10.5rem] px-3 py-2 align-top">
                                        <div className="flex gap-1">
                                          <input
                                            value={r.barcode ?? ""}
                                            onChange={(e) => {
                                              const v = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 13);
                                              setVariantRows((prev) =>
                                                prev.map((x) =>
                                                  x.label === r.label
                                                    ? { ...x, barcode: v }
                                                    : x,
                                                ),
                                              );
                                            }}
                                            inputMode="numeric"
                                            placeholder="13 digits"
                                            maxLength={13}
                                            className="h-11 min-w-0 max-w-[7.5rem] flex-1 rounded-2xl border border-slate-200 bg-white px-2 text-left text-[13px] text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                          />
                                          <button
                                            type="button"
                                            title="Generate barcode"
                                            onClick={() =>
                                              generateVariantBarcode(r.label)
                                            }
                                            className="h-11 shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                          >
                                            Gen
                                          </button>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        <input
                                          value={r.costPrice}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setVariantRows((prev) =>
                                              prev.map((x) =>
                                                x.label === r.label
                                                  ? { ...x, costPrice: v }
                                                  : x,
                                              ),
                                            );
                                          }}
                                          inputMode="decimal"
                                          placeholder="0"
                                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                        />
                                      </td>
                                      <td className="px-4 py-2">
                                        <input
                                          value={r.sellingPrice}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setVariantRows((prev) =>
                                              prev.map((x) =>
                                                x.label === r.label
                                                  ? { ...x, sellingPrice: v }
                                                  : x,
                                              ),
                                            );
                                          }}
                                          inputMode="decimal"
                                          placeholder="0"
                                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                        />
                                      </td>
                                      <td className="min-w-[5.5rem] px-3 py-2">
                                        <input
                                          value={r.discount}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setVariantRows((prev) =>
                                              prev.map((x) =>
                                                x.label === r.label
                                                  ? { ...x, discount: v }
                                                  : x,
                                              ),
                                            );
                                          }}
                                          inputMode="decimal"
                                          placeholder="0"
                                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                        />
                                      </td>
                                      <td className="min-w-[7rem] px-3 py-2">
                                        <input
                                          value={r.hsn}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setVariantRows((prev) =>
                                              prev.map((x) =>
                                                x.label === r.label
                                                  ? { ...x, hsn: v }
                                                  : x,
                                              ),
                                            );
                                          }}
                                          inputMode="numeric"
                                          placeholder="e.g. 30049099"
                                          maxLength={8}
                                          className="h-11 w-full min-w-[7rem] rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                        />
                                      </td>
                                      <td className="px-4 py-2">
                                        <input
                                          value={r.qty}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setVariantRows((prev) =>
                                              prev.map((x) =>
                                                x.label === r.label
                                                  ? { ...x, qty: v }
                                                  : x,
                                              ),
                                            );
                                          }}
                                          inputMode="numeric"
                                          placeholder="0"
                                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                        />
                                      </td>
                                      <td className="min-w-[9rem] px-3 py-2 align-top">
                                        <input
                                          ref={(el) => {
                                            variantFileRefs.current[r.label] =
                                              el;
                                          }}
                                          type="file"
                                          multiple
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            addVariantImages(
                                              r.label,
                                              e.target.files,
                                            );
                                            e.target.value = "";
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            variantFileRefs.current[
                                              r.label
                                            ]?.click()
                                          }
                                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                        >
                                          Upload
                                        </button>
                                        {(r.images?.length || 0) > 0 ? (
                                          <span className="ml-2 text-xs text-slate-500">
                                            {r.images.length} file
                                            {r.images.length !== 1 ? "s" : ""}
                                          </span>
                                        ) : null}
                                        {r.images?.length > 0 ? (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {r.images.map((img, idx) => {
                                              const preview =
                                                getImagePreview(img);
                                              return (
                                                <div
                                                  key={`${r.label}-img-${idx}`}
                                                  className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200"
                                                >
                                                  <img
                                                    src={preview}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                  />
                                                  <button
                                                    type="button"
                                                    className="absolute right-0 top-0 rounded-bl bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                                                    onClick={() =>
                                                      removeVariantImage(
                                                        r.label,
                                                        idx,
                                                      )
                                                    }
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : null}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              Tip: use Generate missing barcodes or Gen per row.
                              Enter HSN, cost, sell, disc (₹), qty; add photos
                              if needed.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <Field
                                label="HSN code"
                                hint="required with quantity (digits)"
                              >
                                <Input
                                  value={form.hsn}
                                  onChange={(e) =>
                                    setForm((p) => ({
                                      ...p,
                                      hsn: e.target.value,
                                    }))
                                  }
                                  inputMode="numeric"
                                  placeholder="e.g. 30049099"
                                  maxLength={8}
                                />
                              </Field>
                              <Field label="Quantity" hint="required">
                                <Input
                                  value={form.quantity}
                                  onChange={(e) =>
                                    setForm((p) => ({
                                      ...p,
                                      quantity: e.target.value,
                                    }))
                                  }
                                  inputMode="numeric"
                                  placeholder="e.g. 10"
                                />
                              </Field>
                              <Field label="Discount" hint="₹ optional">
                                <Input
                                  value={form.discount}
                                  onChange={(e) =>
                                    setForm((p) => ({
                                      ...p,
                                      discount: e.target.value,
                                    }))
                                  }
                                  inputMode="decimal"
                                  placeholder="e.g. 20"
                                />
                              </Field>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                              <p className="text-sm font-semibold text-slate-800">
                                Product photos
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Optional images for this SKU (stored locally
                                until API is wired).
                              </p>
                              <input
                                ref={productImagesRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  addProductImages(e.target.files);
                                  e.target.value = "";
                                }}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  productImagesRef.current?.click()
                                }
                                className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                              >
                                Upload images
                              </button>
                              {form.images?.length > 0 ? (
                                <span className="ml-3 text-xs text-slate-500">
                                  {form.images.length} selected
                                </span>
                              ) : null}
                              {form.images?.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {form.images.map((img, idx) => {
                                    const preview = getImagePreview(img);
                                    return (
                                      <div
                                        key={`product-img-${idx}`}
                                        className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200"
                                      >
                                        <img
                                          src={preview}
                                          alt=""
                                          className="h-full w-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          className="absolute right-0 top-0 rounded-bl bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                                          onClick={() =>
                                            removeProductImage(idx)
                                          }
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || saving}
                            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving ? "Updating..." : "Update Stock"}
                          </button>
                        </div>
                      </div>

                      {!canSave ? (
                        <p className="mt-3 text-xs text-slate-400">
                          Fill product + category + stock; with variants, enter
                          HSN for each line you fill qty.
                        </p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
