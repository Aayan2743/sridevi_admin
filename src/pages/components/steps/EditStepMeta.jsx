import { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import api from "../../../api/axios";
import { showErrorToast } from "../../../utils/swal";

const EditStepMeta = forwardRef(({ productId, meta }, ref) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  /* ================= PREFILL FROM API ================= */
  useEffect(() => {
    if (!meta) return;

    setTitle(meta.meta_title || "");
    setDescription(meta.meta_description || "");

    if (meta.meta_tags) {
      setTags(
        Array.isArray(meta.meta_tags)
          ? meta.meta_tags
          : meta.meta_tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
      );
    }
  }, [meta]);

  /* ================= ADD TAG ================= */
  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const cleanedTag = tagInput.trim();
      if (!tags.some((tag) => tag.toLowerCase() === cleanedTag.toLowerCase())) {
        setTags((prev) => [...prev, cleanedTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  /* ================= SAVE STEP ================= */
  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        showErrorToast("Product not found");
        return false;
      }

      try {
        await api.post(
          `/admin-dashboard/product-seo-meta/update-meta/${productId}`,
          {
            meta_title: title,
            meta_description: description,
            meta_tags: tags.join(","), // 🔥 store as string
          },
        );

        return true;
      } catch (err) {
        console.error("META SAVE ERROR:", err);
        showErrorToast("Failed to save meta");
        return false;
      }
    },
  }));

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">SEO Meta Information</h3>
        <p className="text-sm text-slate-500">
          Add search-friendly text so your product looks better on Google and social previews.
        </p>
      </div>

      {/* META TITLE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Meta Title</label>
          <span
            className={`text-xs font-medium ${title.length > 55 ? "text-amber-600" : "text-slate-400"}`}
          >
            {title.length}/60
          </span>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="Example: Premium Cotton T-Shirt for Men"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p className="text-xs text-slate-400">
          Keep it short and clear. Around 50-60 characters works best.
        </p>
      </div>

      {/* META DESCRIPTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Meta Description</label>
          <span
            className={`text-xs font-medium ${description.length > 150 ? "text-amber-600" : "text-slate-400"}`}
          >
            {description.length}/160
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={160}
          rows={4}
          placeholder="Write a compelling summary that encourages users to click your product."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p className="text-xs text-slate-400">
          Aim for 140-160 characters and include a key benefit.
        </p>
      </div>

      {/* META TAGS */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Meta Tags</label>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Type a tag and press Enter (e.g. men fashion)"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
        <p className="text-xs text-slate-400">
          Add relevant keywords. Duplicate tags are ignored automatically.
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full px-1 text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-700"
                aria-label={`Remove tag ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          {!tags.length && (
            <p className="text-xs text-slate-400">No tags added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default EditStepMeta;
