import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import api from "../../../api/axios";
import { showErrorToast } from "../../../utils/swal";

const EditStepTax = forwardRef(({ productId, data, productStatus }, ref) => {
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstType, setGstType] = useState("inclusive");
  const [gstPercent, setGstPercent] = useState("0.00");

  const [affinityEnabled, setAffinityEnabled] = useState(false);
  const [affinityPercent, setAffinityPercent] = useState("0.00");

  const [isPublished, setIsPublished] = useState(false);

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (!data) return;

    console.log("RUNNING PREFILL", data);

    setGstEnabled(Boolean(data.gst_enabled));
    setGstType(data.gst_type || "inclusive");
    setGstPercent(Number(data.gst_percent ?? 0).toFixed(2));

    setAffinityEnabled(Boolean(data.affinity_enabled));
    setAffinityPercent(Number(data.affinity_percent ?? 0).toFixed(2));

    setIsPublished(productStatus === "Published");
  }, [data, productStatus]);

  /* ================= SAVE STEP ================= */
  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        showErrorToast("Product not found");
        return false;
      }

      try {
        await api.post(
          `/admin-dashboard/product-tax-affinity/update-tax/${productId}`,
          {
            gst_enabled: gstEnabled,
            gst_type: gstType,
            gst_percent: gstEnabled ? Number(gstPercent) : 0,

            affinity_enabled: affinityEnabled,
            affinity_percent: affinityEnabled ? Number(affinityPercent) : 0,

            status: isPublished ? "Published" : "draft", // 👈 IMPORTANT
          },
        );

        return true;
      } catch (err) {
        console.error("TAX SAVE ERROR:", err);
        showErrorToast("Failed to save settings");
        return false;
      }
    },
  }));

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">Tax, Affinity & Publish</h3>
        <p className="text-sm text-slate-500">
          Configure pricing taxes, affinity settings, and final product visibility.
        </p>
      </div>

      {/* ================= PUBLISH ================= */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Publish Product</span>
        </label>

        <p className="mt-2 text-sm text-slate-500">
          Status:{" "}
          <span
            className={`font-medium ${
              isPublished ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </span>
        </p>
      </div>

      {/* ================= GST ================= */}
      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={gstEnabled}
            onChange={(e) => setGstEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Enable GST</span>
        </label>

        <div
          className={`grid gap-3 sm:grid-cols-2 ${!gstEnabled ? "opacity-60" : ""}`}
        >
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              GST Type
            </label>
            <select
              value={gstType}
              disabled={!gstEnabled}
              onChange={(e) => setGstType(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              GST Percent
            </label>
            <div className="relative">
              <input
                type="number"
                value={gstPercent}
                disabled={!gstEnabled}
                min="0"
                step="0.01"
                onChange={(e) => setGstPercent(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= AFFINITY ================= */}
      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={affinityEnabled}
            onChange={(e) => setAffinityEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Enable Affinity</span>
        </label>

        <div className={!affinityEnabled ? "opacity-60" : ""}>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Affinity Percent
          </label>
          <div className="relative max-w-[220px]">
            <input
              type="number"
              value={affinityPercent}
              disabled={!affinityEnabled}
              min="0"
              step="0.01"
              onChange={(e) => setAffinityPercent(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EditStepTax;
