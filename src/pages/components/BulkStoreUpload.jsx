import { useState, useRef } from "react";
import api from "../../api/axios";
import { showSuccessToast, showErrorToast } from "../../utils/swal";

const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isValidExtension(name) {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export default function BulkStoreUpload({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setDragOver(false);
    setValidationError("");
    setUploadProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const acceptFile = (f) => {
    setValidationError("");
    if (!f) return;

    if (!isValidExtension(f.name)) {
      setValidationError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      setFile(null);
      return;
    }

    if (f.size > MAX_SIZE) {
      setValidationError(`File too large (${formatSize(f.size)}). Maximum is 10 MB.`);
      setFile(null);
      return;
    }

    setFile(f);
  };

  const onDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) acceptFile(dropped);
  };

  const onFileChange = (e) => {
    const selected = e.target?.files?.[0];
    if (selected) acceptFile(selected);
    e.target.value = "";
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(
        "/admin-dashboard/product-template/store",
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "store_template.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccessToast("Template downloaded");
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to download template");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setValidationError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/admin-dashboard/offline-store/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      setUploadProgress(100);
      showSuccessToast("Store items uploaded successfully");
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Upload failed";
      showErrorToast(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Bulk Upload Store Items
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload a CSV or XLSX file to create multiple store inventory items at once.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Drag & Drop Zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
              dragOver
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50"
            }`}
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {dragOver ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              or <span className="text-emerald-600 underline">browse files</span>
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
              aria-label="Select file for store bulk upload"
            />
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {/* Selected file info */}
          {file && !validationError && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => { setFile(null); setValidationError(""); }}
                className="rounded-lg p-1 text-slate-400 transition hover:text-red-500"
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          {/* Store info notice */}
          {file && !validationError && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-800">
                Store inventory bulk upload
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                Upload store items with name, SKU, price, stock, and category. 
                These items will be available in POS offline store inventory only.
              </p>
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            onClick={downloadTemplate}
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            Download Template
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}