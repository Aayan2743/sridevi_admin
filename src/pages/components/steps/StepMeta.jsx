import { forwardRef, useImperativeHandle, useState } from "react";
import api from "../../../api/axios";

const StepMeta = forwardRef(({ productId }, ref) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const titleLength = title.length;
  const descriptionLength = description.length;
  const titleTone =
    titleLength > 60 ? "text-red-500" : titleLength > 50 ? "text-amber-500" : "text-slate-400";
  const descriptionTone =
    descriptionLength > 160
      ? "text-red-500"
      : descriptionLength > 140
        ? "text-amber-500"
        : "text-slate-400";

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const commitTag = () => {
    const value = tagInput.trim();
    if (!value) return;

    if (!tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }

    setTagInput("");
  };

  // 🔥 THIS WILL BE CALLED BY PARENT
  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        alert("Product ID missing");
        return false;
      }

      try {
        setLoading(true);
        await api.post(`/admin-dashboard/product-seo-meta/${productId}`, {
          meta_title: title,
          meta_description: description,
          meta_tags: tags.join(","), // ✅ must be string
        });

        return true;
      } catch (err) {
        console.error(err);
        alert("Failed to save SEO meta");
        return false;
      } finally {
        setLoading(false);
      }
    },
  }));

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50" />

      <div className="relative space-y-6 p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
              Seo setup
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                SEO Meta Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Improve how this product appears in search engines with a clear
                title, compelling description, and relevant tags.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
            <MetaStat label="Title" value={`${titleLength}/60`} />
            <MetaStat label="Description" value={`${descriptionLength}/160`} />
            <MetaStat label="Tags" value={String(tags.length).padStart(2, "0")} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-slate-800">
                  Search Preview Basics
                </h4>
                <p className="text-sm text-slate-500">
                  Keep titles concise and descriptions informative to improve
                  click-through rate.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <FieldLabel
                    label="Meta Title"
                    helper="Aim for a concise title with important keywords near the front."
                  />
                  <input
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    maxLength={60}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Premium Cotton T-Shirt for Men"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Recommended length: 50 to 60 characters
                    </p>
                    <p className={`text-xs font-medium ${titleTone}`}>
                      {titleLength}/60
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel
                    label="Meta Description"
                    helper="Summarize the product value clearly in one short paragraph."
                  />
                  <textarea
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    maxLength={160}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a search-friendly description that highlights quality, features, and shopper intent."
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Recommended length: 140 to 160 characters
                    </p>
                    <p className={`text-xs font-medium ${descriptionTone}`}>
                      {descriptionLength}/160
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel
                    label="Meta Tags"
                    helper="Press Enter or use the add button to save each keyword tag."
                  />
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Type tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={commitTag}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Add Tag
                    </button>
                  </div>

                  <div className="mt-4 flex min-h-[64px] flex-wrap gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-3">
                    {tags.length > 0 ? (
                      tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(i)}
                            className="rounded-full bg-white px-1.5 py-0.5 text-xs text-emerald-700 transition hover:bg-emerald-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">
                        No tags added yet. Add keywords shoppers may search for.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-base font-semibold text-slate-800">
                Search Preview
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                A quick preview of how your listing may appear in search results.
              </p>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Google preview
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-lg font-medium leading-snug text-blue-700">
                    {title || "Your product meta title will appear here"}
                  </p>
                  <p className="text-sm text-emerald-700">
                    www.yourstore.com / products / your-item
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {description ||
                      "Your meta description preview will show here so you can quickly judge how persuasive and readable it looks."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
              <h4 className="text-base font-semibold text-slate-800">
                Best Practice Tips
              </h4>
              <div className="mt-4 space-y-3">
                <TipRow
                  title="Use natural keywords"
                  description="Write for people first, then make sure the important terms are included naturally."
                />
                <TipRow
                  title="Keep it readable"
                  description="Avoid stuffing too many keywords into the title or description."
                />
                <TipRow
                  title="Add focused tags"
                  description="Use relevant product terms, categories, colors, or materials shoppers might search."
                />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Saving SEO meta...
          </div>
        )}
      </div>
    </div>
  );
});

export default StepMeta;

function FieldLabel({ label, helper }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function MetaStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TipRow({ title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
