import { useEffect, useState } from "react";
import api from "../api/axios";
import useDynamicTitle from "../hooks/useDynamicTitle";
import {
  confirmAction,
  showErrorToast,
  showSuccessToast,
} from "../utils/swal";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function BulkVariantImages() {
  useDynamicTitle("Product & Variant Images");

  const { can, permissions } = useAuth();


  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [variantImages, setVariantImages] = useState({});
  const [productImages, setProductImages] = useState({});

  const [previewVariantImages, setPreviewVariantImages] = useState({});
  const [previewProductImages, setPreviewProductImages] = useState({});

  const [barcodePopup, setBarcodePopup] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [selectedBarcodes, setSelectedBarcodes] = useState([]);
  const hasPendingUploads =
    Object.keys(variantImages).length > 0 || Object.keys(productImages).length > 0;
  const selectedUploadCount =
    Object.values(variantImages).reduce((sum, files) => sum + files.length, 0) +
    Object.values(productImages).reduce((sum, files) => sum + files.length, 0);

  /* ================= FETCH ================= */

  const openBarcodePopup = (variant) => {
    setBarcodeList(variant.barcodes || []);
    setBarcodePopup(true);
  };






  const closeBarcodePopup = () => {
    setBarcodePopup(false);
    setSelectedBarcodes([]);
  };

  const printSingleBarcode = async (barcode) => {

    console.log(barcode);
    const res = await api.get(
      `/admin-dashboard/product/print-single-barcode/${barcode.barcode}`,
      { responseType: "text" },
    );

    sendToPrinter(res.data);
  };



  const printSingleBarcodeOneByOne = async (barcode) => {
    try {
      const res = await api.get(
        `/admin-dashboard/product/print-single-barcode/${barcode}`,
        { responseType: "text" }
      );

      // ✅ First print
      const printed = sendToPrinter(res.data);

      // 👉 Only update if print successful
      if (printed !== false) {
        setBarcodeList((prevList) =>
          prevList.map((item) =>
            item.barcode === barcode
              ? {
                ...item,
                print_count: (parseInt(item.print_count) || 0) + 1,
              }
              : item
          )
        );
      }

    } catch (err) {
      console.error(err);
    }
  };





  const toggleBarcode = (barcode) => {
    setSelectedBarcodes((prev) =>
      prev.includes(barcode)
        ? prev.filter((b) => b !== barcode)
        : [...prev, barcode]
    );
  };

  // const printBarcode = async (variantId) => {
  //   const res = await api.get(
  //     `/admin-dashboard/product/print-barcode/${variantId}`,
  //     {
  //       responseType: "text",
  //     },
  //   );

  //   const tspl = res.data;

  //   sendToPrinter(tspl);
  // };

  const printBarcode = async (variantId) => {
    try {
      const res = await api.get(
        `/admin-dashboard/product/print-barcode/${variantId}`,
        { responseType: "text" }
      );

      const tspl = res.data;

      // ✅ Send to printer
      const printed = sendToPrinter(tspl);

      // ✅ Only update if print success
      if (printed !== false) {
        setBarcodeList((prevList) =>
          prevList.map((item) =>
            item.variant_id === variantId
              ? {
                ...item,
                print_count: (parseInt(item.print_count) || 0) + 1,
              }
              : item
          )
        );
      }

    } catch (err) {
      console.error("Print error:", err);
    }
  };

  const sendToPrinter = async (tspl) => {
    try {
      if (!window.qz) {
        showErrorToast("QZ Tray not loaded");
        return false;
      }

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }

      //  const printers = await qz.printers.find();

      const printer = await qz.printers.find("4BARCODE 4B-2054TB");
      console.log("Available printers:", printer);

      const config = qz.configs.create(printer);

      await qz.print(config, [tspl]);
      return true;
    } catch (error) {
      console.error("Print error:", error);
      showErrorToast("Printer error");
      return false;
    }
  };
  const fetchVariants = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/product-variants", {
        params: { search: query, page, perPage },
      });

      setVariants(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [query, page]);

  /* ================= SELECT IMAGES ================= */

  const handleVariantImageChange = (variantId, files) => {
    const fileArray = Array.from(files);

    setVariantImages((prev) => ({
      ...prev,
      [variantId]: fileArray,
    }));

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setPreviewVariantImages((prev) => ({
      ...prev,
      [variantId]: previews,
    }));
  };

  const handleProductImageChange = (productId, files) => {
    const fileArray = Array.from(files);

    setProductImages((prev) => ({
      ...prev,
      [productId]: fileArray,
    }));

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setPreviewProductImages((prev) => ({
      ...prev,
      [productId]: previews,
    }));
  };

  /* ================= DELETE ================= */

  const deleteVariantImage = async (id) => {
    const confirmed = await confirmAction("Delete variant image?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin-dashboard/delete-variant-image/${id}`);
      showSuccessToast("Variant image deleted");
      fetchVariants();
    } catch {
      showErrorToast("Delete failed");
    }
  };

  const deleteProductImage = async (id) => {
    const confirmed = await confirmAction("Delete product image?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin-dashboard/delete-product-image/${id}`);
      showSuccessToast("Product image deleted");
      fetchVariants();
    } catch {
      showErrorToast("Delete failed");
    }
  };

  /* ================= UPLOAD ================= */
  const generateBarcode = async () => {
    try {
      const res = await api.get(
        `/admin-dashboard/product/generate-old-barcodes`,
      );

      showSuccessToast(res.data.message || "Barcodes generated");

      fetchVariants(); // refresh table
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to generate barcodes");
    }
  };

  const uploadImages = async () => {
    const formData = new FormData();

    Object.entries(variantImages).forEach(([variantId, files]) => {
      files.forEach((file) => {
        formData.append(`variant_images[${variantId}][]`, file);
      });
    });

    Object.entries(productImages).forEach(([productId, files]) => {
      files.forEach((file) => {
        formData.append(`product_images[${productId}][]`, file);
      });
    });

    try {
      setUploading(true);

      const res = await api.post(
        "/admin-dashboard/bulk-product-variant-images",
        formData,
      );

      showSuccessToast(`Uploaded ${res.data.uploaded} images`);

      setVariantImages({});
      setProductImages({});
      setPreviewVariantImages({});
      setPreviewProductImages({});

      fetchVariants();
    } catch (err) {
      console.error(err);
      showErrorToast("Upload failed");
    } finally {
      setUploading(false);
    }
  };


  const printSelectedBarcodes = async () => {
    if (selectedBarcodes.length === 0) {
      showErrorToast("Select at least one barcode");
      return;
    }

    try {
      for (let barcode of selectedBarcodes) {
        const res = await api.get(
          `/admin-dashboard/product/print-single-barcode/${barcode}`,
          { responseType: "text" }
        );

        await sendToPrinter(res.data);
      }

      // 🔥 update UI count
      setBarcodeList(prev =>
        prev.map(b =>
          selectedBarcodes.includes(b.barcode)
            ? { ...b, print_count: b.print_count + 1 }
            : b
        )
      );

      setSelectedBarcodes([]);

    } catch (err) {
      console.error(err);
      showErrorToast("Bulk print failed");
    }
  };



  const handleToggleReturn = async (variant) => {
    try {
      const newValue = !variant.is_returnable;

      await api.post(`/admin-dashboard/product/toggle-returnable/${variant.id}`, {
        is_returnable: newValue ? 1 : 0,
      });

      // ✅ update UI instantly
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variant.id
            ? { ...v, is_returnable: newValue }
            : v
        )
      );
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to update");
    }
  };


  if (!can("varients.view")) {
    return (
      <AccessDenied />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Product & Variant Image Manager</h1>
            <p className="mt-1 text-sm text-slate-500">
              Search faster, upload images in bulk, and print barcodes with cleaner controls.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Loaded variants: {variants.length}
              </span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Pending uploads: {selectedUploadCount}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Page {page} / {totalPages}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              placeholder="Search product or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setQuery(search);
                  setPage(1);
                }
              }}
              className="h-11 min-w-[250px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <button
              onClick={() => {
                setQuery(search);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>

            <button
              onClick={() => {
                setSearch("");
                setQuery("");
                setPage(1);
              }}
              className="h-11 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Reset
            </button>

            {can("varients.barcode_generate") && (
              <button
                onClick={generateBarcode}
                className="h-11 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
              >
                Generate Barcodes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100/80 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Product</th>
              {can("varients.is_returnable") && (
                <th className="px-4 py-3 text-center">Returnable</th>
              )}
              <th className="px-4 py-3 text-left">Variant</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Barcodes</th>
              <th className="px-4 py-3 text-left">Product Images</th>
              <th className="px-4 py-3 text-left">Variant Images</th>
              <th className="px-4 py-3 text-left">Upload</th>
            </tr>
            </thead>

            <tbody>
            {loading && (
              <tr>
                <td colSpan="10" className="py-10 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && variants.length === 0 && (
              <tr>
                <td colSpan="10" className="py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">No variants found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try a different product name or SKU to continue.
                  </p>
                </td>
              </tr>
            )}

            {!loading &&
              variants.map((v, i) => (
                <tr key={v.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/60">
                  <td className="px-4 py-3">{(page - 1) * perPage + i + 1}</td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{v.product_name}</p>
                    <p className="text-xs text-slate-500">ID: {v.product_id}</p>
                  </td>

                  {can("varients.is_returnable") && (
                  <td className="px-4 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={v.is_returnable === true}
                        onChange={() => handleToggleReturn(v)}
                      />
                      <span className="relative h-6 w-11 rounded-full bg-red-400 transition-colors duration-200 peer-checked:bg-green-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
                    </label>
                  </td>
                  )}

                  <td className="px-4 py-3">
                    {v.variation_values?.join(" / ") || "-"}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{v.sku}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        Number(v.qty) > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {v.qty ?? "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {can("varients.barcode_view") && (
                        <button
                          onClick={() => openBarcodePopup(v)}
                          className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          View
                        </button>
                      )}

                      {can("varients.barcode_print") && (
                        <button
                          onClick={() => printBarcode(v.id)}
                          className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Print
                        </button>
                      )}
                    </div>
                  </td>

                  {/* PRODUCT IMAGES */}

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {v.product_images?.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                              className="h-12 w-12 rounded-lg border border-slate-200 object-cover shadow-sm"
                          />
                          {can("varients.delete_product_image") && (
                            <button
                              onClick={() => deleteProductImage(img.id)}
                              className="absolute -right-2 -top-2 rounded bg-red-500 px-1 text-xs text-white"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {previewProductImages[v.product_id] && (
                      <div className="mt-2 flex gap-2">
                        {previewProductImages[v.product_id].map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            className="h-12 w-12 rounded-lg border border-indigo-200 ring-2 ring-indigo-100"
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* VARIANT IMAGES */}

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {v.variant_images?.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                              className="h-12 w-12 rounded-lg border border-slate-200 object-cover shadow-sm"
                          />
                          {can("varients.delete_varient_image") && (
                            <button
                              onClick={() => deleteVariantImage(img.id)}
                              className="absolute -right-2 -top-2 rounded bg-red-500 px-1 text-xs text-white"
                            >
                              ✕
                            </button>
                          )}

                        </div>
                      ))}
                    </div>

                    {previewVariantImages[v.id] && (
                      <div className="mt-2 flex gap-2">
                        {previewVariantImages[v.id].map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            className="h-12 w-12 rounded-lg border border-indigo-200 ring-2 ring-indigo-100"
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                        Add Product Images
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={(e) =>
                            handleProductImageChange(v.product_id, e.target.files)
                          }
                        />
                      </label>

                      {productImages[v.product_id] && (
                        <span className="text-xs text-slate-500">
                          {productImages[v.product_id].length} selected
                        </span>
                      )}

                      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
                        Add Variant Images
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={(e) =>
                            handleVariantImageChange(v.id, e.target.files)
                          }
                        />
                      </label>

                      {variantImages[v.id] && (
                        <span className="text-xs text-slate-500">
                          {variantImages[v.id].length} selected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 py-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded-lg border px-3 py-1 text-sm ${
                page === i + 1
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {can("varients.add_image") && (
          <button
            onClick={uploadImages}
            disabled={uploading || !hasPendingUploads}
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : `Upload Selected Images${selectedUploadCount ? ` (${selectedUploadCount})` : ""}`}
          </button>
        )}
      </div>

      {barcodePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="max-h-[560px] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Barcodes</h2>

              <button
                onClick={closeBarcodePopup}
                className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="mb-3 flex justify-between">
                <button
                  onClick={printSelectedBarcodes}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Print Selected ({selectedBarcodes.length})
                </button>
              </div>
              {barcodeList.length === 0 && <p className="text-slate-500">No barcodes</p>}

              {barcodeList.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBarcodes.includes(b.barcode)}
                      onChange={() => toggleBarcode(b.barcode)}
                    />

                    <span>
                      {b.barcode}
                      <span className="ml-2 text-xs text-slate-500">
                        ({b.print_count})
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => printSingleBarcodeOneByOne(b.barcode)}
                    className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Print
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
