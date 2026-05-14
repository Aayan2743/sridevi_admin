import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import RichTextEditor from "../RichTextEditor";

export default function StepBasic({ setStep, setProductId }) {
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

  // const mainCategories = categories.filter((c) => c.parent_id === null);

  const mainCategories = categories.filter(
    (c) => c.parent_id === null || c.parent_id === 0,
  );
  // const subCategories = categories.filter(
  //   (c) => c.parent_id === form.category_id,
  // );

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

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpecRow = () =>
    setSpecifications([...specifications, { key: "", value: "" }]);

  const removeSpecRow = (index) =>
    setSpecifications(specifications.filter((_, i) => i !== index));

  const handleRichTextChange = (value) => {
    setDynamicData((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  const handleSubmit = async () => {
    if (loading) return; // prevent double request

    if (!form.name || !form.category_id) {
      alert("Required fields missing");
      return;
    }

    const formattedSpecs = specifications
      .filter((s) => s.key && s.value)
      .reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

    try {
      setLoading(true);

      const res = await api.post("/admin-dashboard/create-product", {
        ...form,
        category_id: form.subcategory_id || form.category_id,
        specifications: formattedSpecs,
        extra_details: dynamicData,
      });

      setProductId(res.data?.product?.id);
      setStep(2);
    } catch (err) {
      if (err.response?.status === 422) {
        alert(err.response.data.errors);
      } else {
        alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Loading product setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        {/* 🔥 HEADER */}
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50" />
          <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:p-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
                Product setup
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Create Product
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Build a polished product listing with clean basic details,
                  structured information, and rich content sections.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
              <StatCard label="Step" value="01" />
              <StatCard
                label="Basic fields"
                value={`${completedBasicFields}/3`}
              />
              <StatCard label="Sections" value={String(tabs.length).padStart(2, "0")} />
            </div>
          </div>
        </div>

        {/* 🔹 MAIN CONTENT */}
        <div className="mt-6 space-y-6">
          {/* 🧾 BASIC INFO CARD */}
          <div className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Start with the product identity and category mapping.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  Required to continue
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <FieldLabel label="Product Name" helper="Visible across admin and storefront" />
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <SearchableSelect
                label="Category"
                helper="Choose the primary catalog group"
                options={mainCategories}
                value={form.category_id}
                onChange={(id) => handleChange("category_id", id)}
                placeholder="Select category"
              />

              {form.category_id && subCategories.length > 0 ? (
                <SearchableSelect
                  label="Sub Category"
                  helper="Refine where the product will appear"
                  options={subCategories}
                  value={form.subcategory_id}
                  onChange={(id) => handleChange("subcategory_id", id)}
                  placeholder="Select sub category"
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-sm font-medium text-slate-600">
                    Sub category
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Select a category first to unlock sub category options.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 🧠 CONTENT / TABS */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Product Content
                  </h3>
                  <p className="text-sm text-slate-500">
                    Fill each section with polished content customers can trust.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  {activeTab}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6 xl:flex-row">
              {/* 🔹 LEFT TAB SIDEBAR */}
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

              {/* 🔹 RIGHT CONTENT */}
              <div className="min-w-0 flex-1">
                {activeTab === "Product Specifications" ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-slate-800">
                          Product Specifications
                        </h4>
                        <p className="text-sm text-slate-500">
                          Add clear feature labels and their corresponding values.
                        </p>
                      </div>
                      <button
                        onClick={addSpecRow}
                        className="inline-flex w-fit items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        + Add Specification
                      </button>
                    </div>

                    <div className="space-y-3">
                      {specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                            {index + 1}
                          </div>
                          <input
                            placeholder="Field"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 md:w-1/2"
                            value={spec.key}
                            onChange={(e) =>
                              handleSpecChange(index, "key", e.target.value)
                            }
                          />

                          <input
                            placeholder="Value"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 md:w-1/2"
                            value={spec.value}
                            onChange={(e) =>
                              handleSpecChange(index, "value", e.target.value)
                            }
                          />

                          {specifications.length > 1 && (
                            <button
                              onClick={() => removeSpecRow(index)}
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
                      <p className="text-sm font-semibold text-slate-700">
                        {activeTab}
                      </p>
                      <p className="text-xs text-slate-500">
                        Write clean, complete details for this section.
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
        </div>
      </div>

      {/* 🔥 FIXED CTA BAR */}
      <div className="fixed bottom-0 left-0 w-full border-t border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Ready for the next step
            </p>
            <p className="text-xs text-slate-500">
              Save the product basics to continue to media upload.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)] transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Product..." : "Create Product ->"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SEARCHABLE SELECT ================= */

function SearchableSelect({
  label,
  helper,
  options,
  value,
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => o.id == value);

  return (
    <div className="relative" ref={ref}>
      <FieldLabel label={label} helper={helper} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition hover:bg-white focus:border-blue-400 focus:bg-white"
      >
        <span className={selected ? "text-slate-700" : "text-slate-400"}>
          {selected ? selected.name : placeholder}
        </span>
        <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition hover:bg-indigo-50 ${
                item.id == value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700"
              }`}
            >
              {item.name}
            </div>
          ))}
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
