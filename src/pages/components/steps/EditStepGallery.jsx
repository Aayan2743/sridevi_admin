

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import api from "../../../api/axios";

const EditStepGallery = forwardRef(
  ({ productId, existingImages = [], existingVideo = [] }, ref) => {
    const inputRef = useRef(null);

    /* ================= STATE ================= */

    const [savedImages, setSavedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [mainImageId, setMainImageId] = useState(null);

    const [videoUrls, setVideoUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    /* ================= LOAD EXISTING IMAGES ================= */

    useEffect(() => {
      if (!existingImages?.length) return;

      const mapped = existingImages.map((img) => ({
        id: img.id,
        url: img.url,
        is_primary: img.is_primary,
      }));

      setSavedImages(mapped);

      const primary = mapped.find((i) => i.is_primary);
      if (primary) setMainImageId(primary.id);
    }, [existingImages]);

    /* ================= LOAD EXISTING VIDEOS ================= */

    useEffect(() => {
      if (Array.isArray(existingVideo)) {
        setVideoUrls(existingVideo.map((v) => v.video_url));
      }
    }, [existingVideo]);

    /* ================= IMAGE HANDLERS ================= */

    const handleFiles = (files) => {
      const list = Array.from(files || []);
      if (!list.length) return;
      setNewImages((prev) => [...prev, ...list]);
      setIsDragging(false);
    };

    const removeSavedImage = async (id) => {
      try {
        await api.delete(`/admin-dashboard/product/image/${id}`);
        setSavedImages((prev) => prev.filter((i) => i.id !== id));
        if (mainImageId === id) setMainImageId(null);
      } catch {
        alert("Failed to delete image");
      }
    };

    const removeNewImage = (index) => {
      setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    /* ================= VIDEO HANDLERS ================= */

    const addVideoUrl = () => setVideoUrls((p) => [...p, ""]);

    const removeVideoUrl = (index) => {
      setVideoUrls((p) => p.filter((_, i) => i !== index));
    };

    const updateVideoUrl = (index, value) => {
      const copy = [...videoUrls];
      copy[index] = value;
      setVideoUrls(copy);
    };

    const activeVideoCount = videoUrls.filter((url) => url.trim()).length;

    /* ================= SAVE STEP ================= */

    useImperativeHandle(ref, () => ({
      async saveStep() {
        if (!productId) {
          alert("Product ID missing");
          return false;
        }

        try {
          setLoading(true);

          /* 1️⃣ UPLOAD NEW IMAGES */
          if (newImages.length > 0) {
            const fd = new FormData();
            newImages.forEach((file) => fd.append("images[]", file));

            await api.post(`/admin-dashboard/product/${productId}/images`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          /* 2️⃣ SET MAIN IMAGE */
          if (mainImageId) {
            await api.post(
              `/admin-dashboard/product/${productId}/set-main-image`,
              {
                image_id: mainImageId,
              },
            );
          }

          /* 3️⃣ UPDATE PRODUCT VIDEOS */
          const urls = videoUrls.filter((v) => v.trim());
          await api.post(`/admin-dashboard/product/${productId}/videos`, {
            video_urls: urls,
          });

          return true;
        } catch (err) {
          console.error(err);
          alert("Failed to save gallery");
          return false;
        } finally {
          setLoading(false);
        }
      },
    }));

    /* ================= UI ================= */

    return (
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50" />
        <div className="relative space-y-6 p-6 md:p-7">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
              Edit media
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              Product Gallery
            </h3>
            <p className="text-sm text-slate-500">
              Manage existing images, upload new media, and update product videos.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:min-w-[340px]">
            <InfoTile
              label="Saved"
              value={String(savedImages.length).padStart(2, "0")}
            />
            <InfoTile
              label="New"
              value={String(newImages.length).padStart(2, "0")}
            />
            <InfoTile
              label="Videos"
              value={String(activeVideoCount).padStart(2, "0")}
            />
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={`relative overflow-hidden rounded-[26px] border p-8 text-center transition-all md:p-10 ${
            isDragging
              ? "cursor-copy border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
              : "cursor-pointer border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 hover:border-blue-200 hover:shadow-lg"
          }`}
        >
          <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" />
          <UploadIcon />
          <p className="mt-4 text-base font-semibold text-slate-900">
            {isDragging ? "Drop images here" : "Upload fresh gallery images"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Drag and drop files here or click to browse. Add sharper media and
            refresh the visual presentation of your product.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              JPG, PNG, WEBP
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              Multiple uploads supported
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              Main image selection
            </span>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* EXISTING IMAGES */}
        {savedImages.length > 0 && (
          <ImageGrid
            title="Existing Images"
            images={savedImages}
            isSaved
            mainImageId={mainImageId}
            onSelect={setMainImageId}
            onRemove={removeSavedImage}
          />
        )}

        {/* NEW IMAGES */}
        {newImages.length > 0 && (
          <ImageGrid
            title="New Images"
            images={newImages}
            onRemove={removeNewImage}
          />
        )}

        {/* VIDEO URLS */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-800">
                Product Video URLs
              </label>
              <p className="text-xs text-slate-500">
                Add or update YouTube, Vimeo, or hosted demo video links.
              </p>
            </div>
            <button
              type="button"
              onClick={addVideoUrl}
              className="inline-flex w-fit items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              + Add Video
            </button>
          </div>

          {videoUrls.map((url, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 md:flex-row md:items-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-500 ring-1 ring-slate-200">
                {index + 1}
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => updateVideoUrl(index, e.target.value)}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="https://youtube.com/watch?v=..."
              />

              <button
                type="button"
                onClick={() => removeVideoUrl(index)}
                className="h-11 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Saving gallery...
          </div>
        )}
        </div>
      </div>
    );
  },
);

export default EditStepGallery;

/* ================= IMAGE GRID ================= */

function ImageGrid({
  title,
  images,
  isSaved = false,
  mainImageId,
  onSelect,
  onRemove,
}) {
  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">
            {isSaved
              ? "Select an existing image to make it the main gallery photo."
              : "Review newly added files before saving the gallery."}
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
          {images.length} item{images.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, i) => {
          const isMain = isSaved && mainImageId === img.id;
          const src = isSaved ? img.url : URL.createObjectURL(img);

          return (
            <div
              key={isSaved ? img.id : i}
              onClick={() => isSaved && onSelect(img.id)}
              className={`relative overflow-hidden rounded-3xl border bg-white cursor-pointer transition-all
              ${
                isMain
                  ? "border-blue-200 ring-2 ring-blue-500 shadow-[0_14px_30px_rgba(59,130,246,0.18)]"
                  : "border-slate-200 hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {isMain && (
                <span
                  className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow"
                >
                  Main
                </span>
              )}

              <img src={src} className="h-36 w-full object-cover" alt="" />

              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {isSaved ? `Saved image #${img.id}` : img.name}
                  </p>
                  {!isSaved && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                      {(img.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isMain
                    ? "Primary gallery image"
                    : isSaved
                      ? "Click to set as main image"
                      : "New image waiting to be saved"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(isSaved ? img.id : i);
                }}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/75 text-sm text-white opacity-90 transition hover:opacity-100"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= ICON ================= */

function UploadIcon() {
  return (
    <svg
      className="h-10 w-10 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
    </svg>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
