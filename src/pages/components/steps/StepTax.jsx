import { forwardRef, useImperativeHandle, useState } from "react";
import api from "../../../api/axios";

const StepTax = forwardRef(({ productId }, ref) => {
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstType, setGstType] = useState("exclusive");
  const [gstPercent, setGstPercent] = useState("");

  const [affinityEnabled, setAffinityEnabled] = useState(false);
  const [affinityPercent, setAffinityPercent] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SAVE STEP ================= */

  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        alert("Product ID missing");
        return false;
      }

      try {
        setLoading(true);
        await api.post(`/admin-dashboard/product-tax-affinity/${productId}`, {
          gst_enabled: gstEnabled,
          gst_type: gstType,
          gst_percent: gstEnabled ? gstPercent : 0,
          affinity_enabled: affinityEnabled,
          affinity_percent: affinityEnabled ? affinityPercent : 0,
        });

        return true;
      } catch {
        alert("Failed to save tax & affinity");
        return false;
      } finally {
        setLoading(false);
      }
    },
  }));

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50" />

      <div className="relative space-y-6 p-6 md:p-7">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm">
            Tax settings
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Tax & Affinity</h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Configure product tax behavior and affiliate commission settings in
              a clear, structured way.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:min-w-[340px]">
          <StatTile label="GST" value={gstEnabled ? "On" : "Off"} />
          <StatTile label="Type" value={gstEnabled ? gstType : "--"} />
          <StatTile label="Affinity" value={affinityEnabled ? "On" : "Off"} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* GST SECTION */}
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-slate-800">GST Settings</h4>
              <p className="mt-1 text-sm text-slate-500">
                Apply GST to this product and control whether tax is inclusive or
                exclusive.
              </p>
            </div>

            <Toggle checked={gstEnabled} onChange={setGstEnabled} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Enable GST</p>
                <p className="text-xs text-slate-400">
                  Turn this on if the product should include GST configuration.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  gstEnabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {gstEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {gstEnabled ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel
                    label="GST Type"
                    helper="Choose how GST should behave in the product pricing."
                  />
                  <select
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value)}
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </div>

                <div>
                  <FieldLabel
                    label="GST Percentage"
                    helper="Enter the applicable GST percentage for this item."
                  />
                  <div className="relative mt-2">
                    <input
                      type="number"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      placeholder="18"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      %
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                <p className="text-sm text-slate-400">
                  GST is currently off. Enable it to configure tax type and percentage.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AFFINITY SECTION */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-slate-800">
                Affinity Settings
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Configure affiliate or partner commission percentage for this
                product.
              </p>
            </div>

            <Toggle checked={affinityEnabled} onChange={setAffinityEnabled} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Enable Affinity
                </p>
                <p className="text-xs text-slate-400">
                  Use this when the product has affiliate commission sharing.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  affinityEnabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {affinityEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {affinityEnabled ? (
              <div className="mt-5">
                <FieldLabel
                  label="Affinity Percentage"
                  helper="Enter the percentage commission available for affiliates."
                />
                <div className="relative mt-2">
                  <input
                    type="number"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    placeholder="5"
                    value={affinityPercent}
                    onChange={(e) => setAffinityPercent(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    %
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5">
                <p className="text-sm text-slate-400">
                  Affinity is off. Turn it on to define an affiliate commission percentage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Saving tax and affinity settings...
          </div>
        )}
      </div>
    </div>
  );
});

export default StepTax;

function FieldLabel({ label, helper }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold capitalize text-slate-900">{value}</p>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-md transition ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
