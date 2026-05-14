import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";

const StepGallery = forwardRef(({ productId }, ref) => {
  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* ================= IMAGE HANDLERS ================= */

  const handleFiles = (files) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setImages((prev) => [...prev, ...list]);
    setIsDragging(false);

    if (images.length === 0 && list.length > 0) {
      setMainIndex(0);
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);

    if (index === mainIndex) setMainIndex(0);
    else if (index < mainIndex) setMainIndex((prev) => prev - 1);
  };

  /* ================= VIDEO HANDLERS ================= */

  const addVideoUrl = () => {
    setVideoUrls((prev) => [...prev, ""]);
  };

  const removeVideoUrl = (index) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index, value) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  const filledVideoUrls = videoUrls.filter((url) => url.trim()).length;

  /* ================= EXPOSE SAVE ================= */

  // useImperativeHandless(ref, () => ({
  //   async saveStep() {
  //     if (!productId) {
  //       alert("Product not created yet");
  //       return false;
  //     }

  //     try {
  //       setLoading(true);

  //       const formData = new FormData();

  //       /* ✅ IMAGES */
  //       images.forEach((file) => {
  //         formData.append("images[]", file);
  //       });

  //       formData.append("main_index", mainIndex);

  //       /* ✅ VIDEO URLS */
  //       videoUrls
  //         .filter((v) => v.trim())
  //         .forEach((url) => {
  //           formData.append("video_urls[]", url);
  //         });

  //       /* 🔥 SINGLE API CALL */
  //       await api.post(
  //         `/admin-dashboard/product/${productId}/gallery`,
  //         formData,
  //         {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         },
  //       );

  //       return true;
  //     } catch (error) {
  //       console.error(error);
  //       alert("Failed to save product gallery");
  //       return false;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  // }));

  useImperativeHandle(ref, () => ({
    async saveStep() {
      if (!productId) {
        alert("Product not created yet");
        return false;
      }

      try {
        setLoading(true);

        const formData = new FormData();

        // ✅ IMAGES
        if (images.length > 0) {
          images.forEach((file) => {
            formData.append("images[]", file);
          });

          formData.append("main_index", mainIndex);
        }

        // ✅ VIDEO URLS
        videoUrls
          .filter((v) => v.trim())
          .forEach((url) => {
            formData.append("video_urls[]", url);
          });

        await api.post(
          `/admin-dashboard/product/${productId}/gallery`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        return true;
      } catch (error) {
        console.error("API Error:", error);

        let message = "Failed to save product gallery";

        if (error.response) {
          // Backend responded with error
          message =
            error.response.data?.errors ||
            error.response.data?.message ||
            "Server error";
        } else if (error.request) {
          // Request made but no response
          message = "No response from server";
        } else {
          // Something else happened
          message = error.message;
        }

        alert(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
  }));

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50" />
      <div className="relative space-y-6 p-6 md:p-7">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
            Gallery setup
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Product Media</h3>
          <p className="text-sm text-slate-500">
            Images & videos for your product
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
          <InfoTile label="Images" value={String(images.length).padStart(2, "0")} />
          <InfoTile
            label="Primary"
            value={images.length > 0 ? `#${mainIndex + 1}` : "--"}
          />
          <InfoTile label="Videos" value={String(filledVideoUrls).padStart(2, "0")} />
        </div>
      </div>

      {/* 🔥 PREMIUM UPLOAD BOX */}
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
        className={`relative group overflow-hidden rounded-[26px] border p-8 transition-all md:p-10 ${
          isDragging
            ? "cursor-copy border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
            : "cursor-pointer border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 hover:border-blue-200 hover:shadow-lg"
        }`}
      >
        {/* GLOW EFFECT */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-200 blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-indigo-200 blur-3xl"></div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* ICON */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm transition ${
              isDragging ? "scale-110 border-blue-200" : "group-hover:scale-110"
            }`}
          >
            <UploadIcon />
          </div>

          <p className="mt-5 text-base font-semibold text-slate-900">
            {isDragging ? "Drop images here" : "Drag & drop your images"}
          </p>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Upload crisp gallery photos and choose the main preview customers
            will see first.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-slate-600">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              PNG, JPG, WEBP
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              Click or drag to upload
            </span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
              Main image selection
            </span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* 🔹 IMAGE GRID */}
      {images.length > 0 && (
        <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Media Preview</p>
              <p className="text-xs text-slate-500">
                Click any image card to make it the main gallery photo.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
              {images.length} file{images.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setMainIndex(i)}
                className={`relative group overflow-hidden rounded-3xl border bg-white cursor-pointer transition-all
              ${
                i === mainIndex
                  ? "border-blue-200 ring-2 ring-blue-500 shadow-[0_14px_30px_rgba(59,130,246,0.18)]"
                  : "border-slate-200 hover:-translate-y-1 hover:shadow-lg"
              }`}
              >
                {/* IMAGE */}
                <img
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="space-y-1 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {img.name}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                      {(img.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {i === mainIndex ? "Primary gallery image" : "Tap to set as main image"}
                  </p>
                </div>

                {/* MAIN BADGE */}
                {i === mainIndex && (
                  <div
                    className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow"
                  >
                    Main
                  </div>
                )}

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/75 text-sm text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 VIDEO SECTION */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <label className="text-sm font-semibold text-slate-800">Video Links</label>
            <p className="text-xs text-slate-500">
              Add YouTube, Vimeo, or hosted product demo URLs.
            </p>
          </div>
          <button
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
              onChange={(e) => handleVideoChange(index, e.target.value)}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="https://youtube.com/..."
            />

            {videoUrls.length > 1 && (
              <button
                onClick={() => removeVideoUrl(index)}
                className="h-11 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          Saving gallery...
        </div>
      )}
      </div>
    </div>
  );
});

export default StepGallery;

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
