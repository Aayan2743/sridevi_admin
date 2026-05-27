import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/swal";
import { pickFileFromGoogleDrive } from "../../utils/googleDrivePicker";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ALLOWED_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/** Template headers for the bulk product + variation CSV */
const CSV_TEMPLATE_HEADERS = [
  "name",
  "category",
  "sku",
  "price",
  "stock",
  "description",
  "image_url",
  "variation_1_name",
  "variation_1_value",
  "variation_2_name",
  "variation_2_value",
  "variation_3_name",
  "variation_3_value",
];

const CSV_TEMPLATE_SAMPLE = [
  "Example Product",
  "Category Name",
  "SKU001",
  "999.99",
  "50",
  "Product description here",
  "https://example.com/image.jpg",
  "Size",
  "M",
  "Color",
  "Red",
  "",
  "",
];

/** Upload source tabs */
const UPLOAD_SOURCES = [
  { key: "local", label: "Local File" },
  { key: "gdrive", label: "Google Drive" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isValidExtension(name) {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Check if Google Drive config is present */
function isGoogleDriveConfigured() {
  return !!(
    import.meta.env.VITE_GOOGLE_API_KEY &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID
  );
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function BulkProductUpload({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverErrors, setServerErrors] = useState(null);
  const [serverMessage, setServerMessage] = useState("");
  const [sourceTab, setSourceTab] = useState("local");
  const [gdriveLoading, setGdriveLoading] = useState(false);
  const [gdriveError, setGdriveError] = useState("");
  const inputRef = useRef(null);

  const gdriveConfigured = isGoogleDriveConfigured();

  /* ── reset state when modal opens/closes ── */
  const reset = useCallback(() => {
    setFile(null);
    setDragOver(false);
    setValidationError("");
    setUploadProgress(0);
    setServerErrors(null);
    setServerMessage("");
    setSourceTab("local");
    setGdriveLoading(false);
    setGdriveError("");
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  /* ── validate & accept file ── */
  const acceptFile = (f) => {
    setValidationError("");
    setServerErrors(null);
    setServerMessage("");

    if (!f) return;

    if (!isValidExtension(f.name)) {
      setValidationError(
        `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
      );
      setFile(null);
      return;
    }

    if (f.size > MAX_SIZE) {
      setValidationError(
        `File too large (${formatSize(f.size)}). Maximum is 10 MB.`,
      );
      setFile(null);
      return;
    }

    setFile(f);
  };

  /* ── drag events ── */
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) acceptFile(dropped);
  };

  /* ── input change ── */
  const onFileChange = (e) => {
    const selected = e.target?.files?.[0];
    if (selected) acceptFile(selected);
    e.target.value = "";
  };

  /* ── Google Drive picker ── */
  const handleGoogleDrivePick = async () => {
    if (!gdriveConfigured) {
      setGdriveError("Google Drive is not configured. Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID in .env.");
      return;
    }
    setGdriveError("");
    setGdriveLoading(true);
    try {
      const picked = await pickFileFromGoogleDrive();
      if (picked) {
        acceptFile(picked);
      }
    } catch (err) {
      console.error("Google Drive error:", err);
      const msg = err?.message || "Failed to open Google Drive picker";
      setGdriveError(msg);
      showErrorToast(msg);
    } finally {
      setGdriveLoading(false);
    }
  };

  /* ── template download ── */
  const downloadTemplate = () => {
    const csvContent =
      CSV_TEMPLATE_HEADERS.join(",") +
      "\n" +
      CSV_TEMPLATE_SAMPLE.join(",");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ── React Query mutation ── */
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(
        "/admin-dashboard/offline-store/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(pct);
            }
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      const created = data?.created_count ?? data?.products_created ?? "?";
      const skipped = data?.skipped_rows ?? data?.warnings ?? [];
      let toastMsg = `${created} product(s) created successfully.`;
      if (skipped.length > 0) {
        toastMsg += ` ${skipped.length} row(s) skipped.`;
      }
      showSuccessToast(toastMsg);
      setServerMessage(toastMsg);
      if (typeof skipped === "string") {
        setServerErrors({ general: skipped });
      }
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      setUploadProgress(0);
      const status = err?.response?.status;
      const body = err?.response?.data;

      if (status === 422 && body?.errors) {
        setServerErrors(body.errors);
        if (body.message) setServerMessage(body.message);
        return;
      }

      const msg =
        body?.message ||
        body?.error ||
        "Upload failed. Please try again.";
      setServerErrors({ general: msg });
      showErrorToast(msg);
    },
  });

  /* ── submit ── */
  const handleUpload = () => {
    if (!file) {
      setValidationError("Please select a file first.");
      return;
    }
    setServerErrors(null);
    setServerMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    mutation.mount();
    mutation.mutate(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      {/* Modal */}
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Bulk Upload Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload a CSV or XLSX file to create multiple products with variations at once.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={mutation.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* ── Upload Source Tabs ── */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {UPLOAD_SOURCES.map((tab) => {
              if (tab.key === "gdrive" && !gdriveConfigured) return null;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setSourceTab(tab.key);
                    setValidationError("");
                    setGdriveError("");
                  }}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    sourceTab === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.key === "gdrive" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      {/* Google Drive icon */}
                      <svg className="h-4 w-4" viewBox="0 0 87 78" fill="none">
                        <path d="M29 78L0 29 14.5 0 43.5 49 29 78z" fill="#0DA960"/>
                        <path d="M87 26L72.5 52H43.5L58 26h29z" fill="#068744"/>
                        <path d="M72.5 52L58 78 43.5 49 58 26l14.5 26z" fill="#FFCD48"/>
                        <path d="M43.5 49L14.5 0H58L43.5 49z" fill="#1FA463"/>
                      </svg>
                      Google Drive
                    </span>
                  ) : (
                    tab.label
                  )}
                </button>
              );
            })}
          </div>

          {/* ── LOCAL UPLOAD ── */}
          {sourceTab === "local" && (
            <>
              {/* Drag & Drop Zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                {/* Upload icon */}
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {dragOver ? "Drop your file here" : "Drag & drop your file here"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  or <span className="text-indigo-600 underline">browse files</span>
                </p>
                <p className="mt-3 text-[11px] text-slate-400">
                  CSV or XLSX • Max 10 MB
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/vnd.ms-excel"
                  onChange={onFileChange}
                  className="hidden"
                  aria-label="Select file for bulk upload"
                />
              </div>
            </>
          )}

          {/* ── GOOGLE DRIVE PICKER ── */}
          {sourceTab === "gdrive" && (
            <div
              onClick={handleGoogleDrivePick}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
                gdriveLoading
                  ? "border-amber-300 bg-amber-50"
                  : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100/50"
              }`}
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {gdriveLoading ? (
                  <svg
                    className="h-6 w-6 animate-spin text-amber-500"
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
                  <svg className="h-6 w-6" viewBox="0 0 87 78" fill="none">
                    <path d="M29 78L0 29 14.5 0 43.5 49 29 78z" fill="#0DA960"/>
                    <path d="M87 26L72.5 52H43.5L58 26h29z" fill="#068744"/>
                    <path d="M72.5 52L58 78 43.5 49 58 26l14.5 26z" fill="#FFCD48"/>
                    <path d="M43.5 49L14.5 0H58L43.5 49z" fill="#1FA463"/>
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {gdriveLoading ? "Opening Google Drive..." : "Pick a file from Google Drive"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {gdriveLoading ? "Please wait..." : "Click to open the Google Drive file picker"}
              </p>
              <p className="mt-3 text-[11px] text-slate-400">
                CSV, XLSX, or Google Sheets • Max 10 MB
              </p>
            </div>
          )}

          {/* ── GDrive error ── */}
          {gdriveError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {gdriveError}
            </div>
          )}

          {/* ── Validation error ── */}
          {validationError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {/* ── Selected file info ── */}
          {file && !validationError && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatSize(file.size)}
                  {sourceTab === "gdrive" && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      Google Drive
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setValidationError("");
                }}
                className="rounded-lg p-1 text-slate-400 transition hover:text-red-500"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Variation info notice ── */}
          {file && !validationError && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3">
              <p className="text-sm font-semibold text-indigo-800">
                Supports product variations
              </p>
              <p className="mt-0.5 text-xs text-indigo-600">
                Include columns like{" "}
                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-[11px]">
                  variation_1_name
                </code>
                ,{" "}
                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-[11px]">
                  variation_1_value
                </code>
                ,{" "}
                <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono text-[11px]">
                  variation_2_name
                </code>
                , etc. in your spreadsheet. Rows with the same product name and
                different variation values will be grouped into one product with
                multiple variants.
              </p>
            </div>
          )}

          {/* ── Server errors / messages ── */}
          {serverErrors && (
            <div className="space-y-2">
              {serverErrors.general && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverErrors.general}
                </div>
              )}

              {/* Field-level errors */}
              {Object.entries(serverErrors)
                .filter(([key]) => key !== "general")
                .map(([field, messages]) => {
                  const msgArr = Array.isArray(messages) ? messages : [messages];
                  return (
                    <div
                      key={field}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-amber-800 capitalize">
                        {field.replace(/[._]/g, " ")}:
                      </span>{" "}
                      <span className="text-amber-700">{msgArr.join(", ")}</span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Success message in UI */}
          {serverMessage && !serverErrors?.general && mutation.isSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {serverMessage}
            </div>
          )}

          {/* ── Progress bar ── */}
          {mutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          {/* Download template link */}
          <button
            onClick={downloadTemplate}
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              />
            </svg>
            Download Template
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={mutation.isPending}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || mutation.isPending}
              className="h-11 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}