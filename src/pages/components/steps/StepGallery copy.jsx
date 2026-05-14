import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import api from "../../../api/axios";

const StepGallery = forwardRef(({ productId }, ref) => {
  const inputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState([""]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE HANDLERS ================= */

  const handleFiles = (files) => {
    const list = Array.from(files);
    setImages((prev) => [...prev, ...list]);

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
    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Product Media</h3>
          <p className="text-xs text-gray-500">
            Images & videos for your product
          </p>
        </div>

        <span className="text-[11px] px-3 py-1 rounded-full bg-blue-100 text-blue-600">
          Step 2
        </span>
      </div>

      {/* 🔥 PREMIUM UPLOAD BOX */}
      <div
        onClick={() => inputRef.current.click()}
        className="relative group overflow-hidden rounded-2xl p-10 cursor-pointer
      bg-gradient-to-br from-blue-50 via-white to-indigo-50
      border border-gray-200 shadow-inner hover:shadow-md transition"
      >
        {/* GLOW EFFECT */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl"></div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* ICON */}
          <div
            className="w-16 h-16 flex items-center justify-center rounded-2xl
          bg-white shadow-sm border group-hover:scale-110 transition"
          >
            <UploadIcon />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-800">
            Drag & drop your images
          </p>

          <p className="text-xs text-gray-400 mt-1">
            or click to upload (PNG, JPG, WEBP)
          </p>

          <div className="mt-3 text-[11px] px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            Max 10 files • 5MB each
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
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-600">Media Preview</p>
            <span className="text-[11px] text-gray-400">Click to set main</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setMainIndex(i)}
                className={`relative group rounded-2xl overflow-hidden cursor-pointer transition
              ${
                i === mainIndex
                  ? "ring-2 ring-blue-600 shadow-md"
                  : "border border-gray-200 hover:shadow-md"
              }`}
              >
                {/* IMAGE */}
                <img
                  src={URL.createObjectURL(img)}
                  alt=""
                  className="h-32 w-full object-cover group-hover:scale-105 transition"
                />

                {/* MAIN BADGE */}
                {i === mainIndex && (
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 text-[10px]
                  bg-blue-600 text-white rounded-full shadow"
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
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center
                rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 VIDEO SECTION */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Video Links</label>

        {videoUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => handleVideoChange(index, e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm
            focus:ring-2 focus:ring-blue-600 outline-none flex-1"
              placeholder="https://youtube.com/..."
            />

            {videoUrls.length > 1 && (
              <button
                onClick={() => removeVideoUrl(index)}
                className="w-10 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addVideoUrl}
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          + Add Video
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-xs text-blue-600 font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          Saving gallery...
        </div>
      )}
    </div>
  );
});

export default StepGallery;

/* ================= ICON ================= */

function UploadIcon() {
  return (
    <svg
      className="w-10 h-10 text-gray-400"
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
