
import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import RichTextEditor from "../RichTextEditor";

export default function EditStepBasic({ setStep, product }) {
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
  });

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  const tabs = [
    "Description",
    "Product Specifications",
    "Return & Exchange",
    "Shipping & Delivery",
    "Manufactured By",
    "Customer Care",
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [dynamicData, setDynamicData] = useState({});
  const completedBasicFields = [
    form.name,
    form.category_id,
    form.subcategory_id || form.category_id,
  ].filter(Boolean).length;

  /* ================= PREFILL ================= */

  useEffect(() => {
    if (!product) return;

    const isSub = product.category?.parent_id;

    setForm({
      name: product.name ?? "",
      category_id: isSub
        ? String(product.category.parent_id)
        : String(product.category_id ?? ""),
      subcategory_id: isSub ? String(product.category_id) : "",
    });

    setSpecifications(
      product.specifications
        ? Object.entries(product.specifications).map(([k, v]) => ({
            key: k,
            value: v,
          }))
        : [{ key: "", value: "" }],
    );

    setDynamicData(product.extra_details || {});
  }, [product]);

  /* ================= FETCH CATEGORIES ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin-dashboard/list-category-all");
        setCategories(res.data?.data || []);
      } catch {
        alert("Failed to load categories");
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const mainCategories = categories.filter(
    (c) => c.parent_id === null || c.parent_id === 0,
  );
  const subCategories = categories.filter(
    (c) => String(c.parent_id) === String(form.category_id),
  );

  /* ================= HANDLERS ================= */

  const handleChange = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "category_id") updated.subcategory_id = "";
      return updated;
    });
  };

  const handleSpecChange = (i, field, value) => {
    const updated = [...specifications];
    updated[i][field] = value;
    setSpecifications(updated);
  };

  const addSpec = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);

  const removeSpec = (i) =>
    setSpecifications(specifications.filter((_, idx) => idx !== i));

  const handleRichTextChange = (val) => {
    setDynamicData((prev) => ({
      ...prev,
      [activeTab]: val,
    }));
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async () => {
    if (!form.name || !form.category_id) {
      alert("Required fields missing");
      return;
    }

    const formattedSpecs = specifications
      .filter((s) => s.key && s.value)
      .reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});

    try {
      setLoading(true);

      await api.post(`/admin-dashboard/update-product/${product.id}`, {
        name: form.name,
        category_id: form.subcategory_id || form.category_id,
        specifications: formattedSpecs,
        extra_details: dynamicData,
      });

      setStep(2);
    } catch {
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50" />
        <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
              Edit basics
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Edit Product
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Update the core product information, category mapping, and content
                sections before moving to the next edit steps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
            <StatCard label="Mode" value="Edit" />
            <StatCard label="Basic fields" value={`${completedBasicFields}/3`} />
            <StatCard label="Sections" value={String(tabs.length).padStart(2, "0")} />
          </div>
        </div>
      </div>

      <div className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
              <p className="text-sm text-slate-500">
                Keep the product name and category structure clean and accurate.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              Product #{product?.id || "--"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <FieldLabel
              label="Product Name"
              helper="Update the public-facing name shown across your catalog."
            />
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <SearchableSelect
            label="Category"
            helper="Select the primary catalog group"
            options={mainCategories}
            value={form.category_id}
            onChange={(id) => handleChange("category_id", id)}
            placeholder="Select category"
          />

          {form.category_id && subCategories.length > 0 ? (
            <SearchableSelect
              label="Sub Category"
              helper="Refine how this product is organized"
              options={subCategories}
              value={form.subcategory_id}
              onChange={(id) => handleChange("subcategory_id", id)}
              placeholder="Select sub category"
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
              <p className="text-sm font-medium text-slate-600">Sub category</p>
              <p className="mt-2 text-sm text-slate-400">
                Choose a category first to unlock sub category options.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Product Content</h3>
              <p className="text-sm text-slate-500">
                Refresh descriptions, specifications, and key policy sections.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              {activeTab}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 xl:flex-row">
          <div className="xl:w-72 xl:flex-shrink-0">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="mb-3 px-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Content Sections
                </p>
              </div>
              <div className="space-y-2">
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <p className="text-[11px] uppercase tracking-wide opacity-70">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <span className="mt-1 block">{tab}</span>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isActive ? "bg-white" : "bg-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {activeTab === "Product Specifications" ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-800">
                      Product Specifications
                    </h4>
                    <p className="text-sm text-slate-500">
                      Update feature labels and values for this product.
                    </p>
                  </div>
                  <button
                    onClick={addSpec}
                    className="inline-flex w-fit items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                        {i + 1}
                      </div>
                      <input
                        placeholder="Field"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 md:w-1/2"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(i, "key", e.target.value)}
                      />
                      <input
                        placeholder="Value"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 md:w-1/2"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                      />
                      {specifications.length > 1 && (
                        <button
                          onClick={() => removeSpec(i)}
                          className="h-11 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-700">{activeTab}</p>
                  <p className="text-xs text-slate-500">
                    Refine the content customers will see for this section.
                  </p>
                </div>
                <RichTextEditor
                  value={dynamicData[activeTab] || ""}
                  onChange={handleRichTextChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition-all duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Updating Product..." : "Update and Continue"}
      </button>
    </div>
  );
}

function SearchableSelect({
  label,
  helper,
  options,
  value,
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <FieldLabel label={label} helper={helper} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition hover:bg-white"
      >
        <span className={selected ? "text-slate-700" : "text-slate-400"}>
          {selected ? selected.name : placeholder}
        </span>
        <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder={`Search ${label}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-52 overflow-y-auto p-2">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition hover:bg-indigo-50 ${
                    String(item.id) === String(value)
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label, helper }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
