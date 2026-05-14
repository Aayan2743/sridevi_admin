import { useEffect, useRef, useState } from "react";
import StepBasic from "./steps/StepBasic";
import StepGallery from "./steps/StepGallery";
import StepVariation from "./steps/StepVariation";
import StepMeta from "./steps/StepMeta";
import StepTax from "./steps/StepTax";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { celebrateSuccess } from "../../utils/celebrate";

const STEPS = ["Basic", "Gallery", "Variation", "SEO", "Tax"];

export default function AddProductDrawer({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState(null);
  const [loading, setLoading] = useState(false);

  const galleryRef = useRef(null);
  const variationRef = useRef(null);
  const metaRef = useRef(null);
  const taxRef = useRef(null);

  useEffect(() => {
    if (!open) {
      // ✅ Reset everything when drawer closes
      setStep(1);
      setProductId(null);

      // optional (safe cleanup)
      galleryRef.current = null;
      variationRef.current = null;
      metaRef.current = null;
      taxRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  if (!open) return null;

  const handleNext = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (step === 2 && galleryRef.current) {
        if (!(await galleryRef.current.saveStep())) return;
      }
      if (step === 3 && variationRef.current) {
        if (!(await variationRef.current.saveStep())) return;
      }
      if (step === 4 && metaRef.current) {
        if (!(await metaRef.current.saveStep())) return;
      }
      if (step === 5 && taxRef.current) {
        if (!(await taxRef.current.saveStep())) return;

        await api.post(`/admin-dashboard/publish-product/${productId}`);

        celebrateSuccess();
        toast.success("Product published successfully 🎉");

        setTimeout(onClose, 1200);
        return;
      }

      setStep((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  const progressPercent = Math.round((step / STEPS.length) * 100);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-slate-950/55 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50 px-4 py-4 pb-32 md:px-6 md:py-6 md:pb-36"
        >
          <div className="mx-auto flex min-h-full max-w-[1800px] gap-4 2xl:gap-5">
            <aside className="hidden w-[220px] shrink-0 xl:block 2xl:w-[240px]">
              <div className="sticky top-6 overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-50 via-purple-50 to-cyan-50" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
                    Product wizard
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                    Add Product
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Complete each step to create a polished product listing with
                    content, media, SEO, and tax configuration.
                  </p>

                  <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-800">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      Step {step} of {STEPS.length}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {STEPS.map((label, index) => {
                      const tabStep = index + 1;
                      const isActive = step === tabStep;
                      const isCompleted = step > tabStep;

                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            if (tabStep <= step || isCompleted) {
                              setStep(tabStep);
                            }
                          }}
                          className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                            isActive
                              ? "border-indigo-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                              isActive
                                ? "bg-white text-indigo-600"
                                : isCompleted
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {isCompleted ? "✓" : `0${tabStep}`.slice(-2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{label}</p>
                            <p
                              className={`text-xs ${
                                isActive ? "text-white/75" : "text-slate-400"
                              }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : isActive
                                  ? "Currently editing"
                                  : "Upcoming step"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

                <div className="relative border-b border-slate-100 bg-slate-50/70 px-5 py-5 md:px-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700 shadow-sm xl:hidden">
                        Step {step} of {STEPS.length}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                          {step === 1
                            ? "Basic Information"
                            : step === 2
                              ? "Product Gallery"
                              : step === 3
                                ? "Product Variations"
                                : step === 4
                                  ? "SEO Meta Setup"
                                  : "Tax & Affinity"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {step === 1
                            ? "Start with the product identity, category, and detailed content."
                            : step === 2
                              ? "Upload strong gallery media and choose the main image."
                              : step === 3
                                ? "Generate and configure all your sellable product variants."
                                : step === 4
                                  ? "Optimize how your product appears in search engines."
                                  : "Finalize tax and commission settings before publishing."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm md:block">
                        <span className="font-semibold text-slate-800">
                          {progressPercent}%
                        </span>{" "}
                        completed
                      </div>
                      <button
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 xl:hidden">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Workflow progress</span>
                      <span>{step}/{STEPS.length}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white px-4 py-5 md:px-6 md:py-6">
                  {step === 1 && (
                    <StepBasic setProductId={setProductId} setStep={setStep} />
                  )}
                  {step === 2 && (
                    <StepGallery ref={galleryRef} productId={productId} />
                  )}
                  {step === 3 && (
                    <StepVariation ref={variationRef} productId={productId} />
                  )}
                  {step === 4 && <StepMeta ref={metaRef} productId={productId} />}
                  {step === 5 && <StepTax ref={taxRef} productId={productId} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-1/2 z-[10000] w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 px-2 md:w-[calc(100%-3rem)] md:px-0">
          <div className="rounded-[26px] border border-white/70 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {step === 5 ? "Ready to publish" : `Continue to ${STEPS[step] || "next step"}`}
                </p>
                <p className="text-xs text-slate-500">
                  {step === 1
                    ? "Complete the basic form to unlock the remaining setup steps."
                    : step === 5
                      ? "Publishing will save the final settings and make the product ready."
                      : "Review this section, save your changes, and move forward."}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 md:justify-end">
                <button
                  onClick={handleBack}
                  disabled={loading || step === 1}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={loading || step === 1}
                  className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 ${
                    step === 5
                      ? "bg-gradient-to-r from-emerald-500 to-green-600"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                  }`}
                >
                  {loading
                    ? step === 5
                      ? "Publishing..."
                      : "Saving..."
                    : step === 5
                      ? "Publish Product"
                      : "Save and Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
