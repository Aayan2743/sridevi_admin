import { useState } from "react";

/* ─────────────────────────────────────────────
   UPI PAYMENT OPTIONS
───────────────────────────────────────────── */
const UPI_APPS = [
  {
    key: "phonepe",
    label: "PhonePe",
    subtitle: "Pay via PhonePe app",
    color: "from-indigo-500 to-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="url(#pp-grad)" stroke="white" strokeWidth="2"/>
        <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="pp-grad" x1="4" y1="4" x2="20" y2="20">
            <stop stopColor="#5F259F"/><stop offset="1" stopColor="#7B3FE4"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    key: "razorpay",
    label: "Razorpay",
    subtitle: "Razorpay payment gateway",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#3399FF"/>
        <path d="M2 10h20M8 15h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "payu",
    label: "PayU",
    subtitle: "PayU payment gateway",
    color: "from-orange-400 to-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#FF6F00"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">PayU</text>
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function PaymentOptionsModal({
  open,
  total,
  onClose,
  onSelect,
  loading: externalLoading,
}) {
  const [selectedApp, setSelectedApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  const handleSelect = async (appKey) => {
    setSelectedApp(appKey);
    setProcessing(true);
    try {
      await onSelect(appKey);
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = processing || externalLoading;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Choose Payment Method
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total Amount:{" "}
              <span className="font-bold text-slate-800">
                ₹ {Number(total).toFixed(2)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          {UPI_APPS.map((app) => {
            const isSelected = selectedApp === app.key;
            const isDisabled = isLoading;

            return (
              <button
                key={app.key}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(app.key)}
                className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                  isSelected
                    ? `${app.border} ${app.bg} scale-[0.97] shadow-inner`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                } ${isDisabled && !isSelected ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
                `}
              >
                {/* App Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                    isSelected
                      ? `bg-gradient-to-br ${app.color} text-white shadow-md`
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {isSelected && app.key !== "qr" ? (
                    <svg
                      className="h-6 w-6 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <div
                      className={
                        isSelected ? "text-white" : ""
                      }
                    >
                      {app.icon}
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? "text-slate-800" : "text-slate-700"
                    }`}
                  >
                    {app.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {app.subtitle}
                  </p>
                </div>

                {/* Checkmark for selected */}
                {isSelected && !processing && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}