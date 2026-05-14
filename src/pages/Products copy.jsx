import { useEffect, useState } from "react";
import api from "../api/axios";
import AddProductDrawer from "./components/AddProductDrawer";
import EditProductDrawer from "./components/EditProductDrawer";
import StatusBadge from "./components/StatusBadge";
import { Upload, Download, Eye, Loader } from "lucide-react";
import toast from "react-hot-toast";

import useDynamicTitle from "../hooks/useDynamicTitle";
import ProductSectionAssign from "./settings/components/ProductSectionAssign";
import { useAuth } from "../auth/AuthContext";

import AccessDenied from "./components/AccessDenied";

export default function Products() {
  useDynamicTitle("Products");

  const { can, permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:", can);
  console.log("User Permissions array:", permissions);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [openSections, setOpenSections] = useState(false);
  const [selectedSectionProduct, setSelectedSectionProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk Import States
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/products", {
        params: {
          search: query,
          page,
          perPage,
        },
      });

      setProducts(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Delete ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await api.delete(`/admin-dashboard/delete-product/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Failed to delete product");
    }
  };

  /* ================= BULK IMPORT ================= */

  const handleDownloadTemplate = async () => {
    try {
      setBulkLoading(true);
      const res = await api.get(
        "/admin-dashboard/products-bulk-import/template",
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setBulkError("Failed to download template");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDownloadSampleData = () => {
    try {
      const link = document.createElement("a");
      link.href = "/final_test.xlsx";
      link.setAttribute("download", "final_test.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setBulkError("Failed to download sample data");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkError("Please select a file");
      return;
    }

    try {
      setBulkLoading(true);
      setBulkError(null);

      const formData = new FormData();
      formData.append("file", bulkFile);

      const res = await api.post(
        "/admin-dashboard/products-bulk-import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.success) {
        setUploadedData(res.data.data);
        setBulkFile(null);
        setShowBulkModal(false);

        // Show success toast after modal closes
        setTimeout(() => {
          toast.success(res.data.message || "Products imported successfully!", {
            duration: 5000,
            position: "top-right",
            style: {
              background: "#10b981",
              color: "#fff",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "14px",
              fontWeight: "500",
            },
            icon: "✓",
          });
          fetchProducts();
        }, 300);
      } else {
        setBulkError(res.data.message || "Upload failed");
        setErrorDetails(res.data);
        setShowBulkModal(false);
        setShowErrorModal(true);
      }
    } catch (err) {
      const errorResponse = err.response?.data;
      setBulkError(errorResponse?.message || "Failed to upload file");
      setErrorDetails(errorResponse);
      setShowBulkModal(false);
      setShowErrorModal(true);
    } finally {
      setBulkLoading(false);
    }
  };

  /* ================= LOAD ON CHANGE ================= */

  useEffect(() => {
    fetchProducts();
  }, [query, page, perPage]);

  if (!can("product.view")) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>

        <div className="flex gap-2">
          <input
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 px-4 border rounded-lg text-sm w-64"
          />

          <button
            onClick={() => {
              setQuery(search);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 border rounded-lg text-sm"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setQuery("");
              setPage(1);
            }}
            className="px-4 py-2 bg-red-100 border rounded-lg text-sm"
          >
            Reset
          </button>

          {can("product.add") && (
            <button
              onClick={() => setOpenAdd(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Product
            </button>
          )}

          {can("product.bulk") && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Upload size={18} />
              Bulk Import
            </button>
          )}
        </div>
      </div>
      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">S No</th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Category</th>

              {/*<th className="px-4 py-3 text-left">Brand</th> */}

              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Sections</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  Loading products...
                </td>
              </tr>
            )}

            {!loading &&
              products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.id}</td>
                  <td className="px-4 py-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.src = "/logo/noimage.jfif"; // optional fallback
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  {/* <td className="px-4 py-3">
                  {p.category_name || "-"} - {p.category_main}
                </td> */}

                  <td className="px-4 py-3 text-sm">
                    {p.category_main ? (
                      <>
                        <span className="text-gray-500">{p.category_main}</span>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-gray-800">
                          {p.category_name}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">
                        {p.category_name || "-"}
                      </span>
                    )}
                  </td>

                  {/* <td className="px-4 py-3">{p.brand_name || "-"}</td> */}
                  <td className="px-4 py-3">₹{p.final_price}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {p.sections && p.sections.length > 0 ? (
                        p.sections.map((section) => (
                          <span
                            key={section.id}
                            className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium"
                          >
                            {section.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* EDIT */}

                      {can("product.edit") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setOpenEdit(true);
                          }}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                      )}

                      {/* SECTION BUTTON */}

                      {can("product.sections") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSectionProduct(p);
                            setOpenSections(true);
                          }}
                          className="text-purple-600 hover:underline"
                        >
                          Sections
                        </button>
                      )}

                      {/* DELETE */}

                      {can("product.delete") && (
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {openSections && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-black/40 z-40"
                  onClick={() => setOpenSections(false)}
                />

                {/* Drawer */}
                <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 p-6 overflow-y-auto transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Assign Sections</h2>

                    <button
                      onClick={() => setOpenSections(false)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      ✕
                    </button>
                  </div>

                  <ProductSectionAssign
                    product={selectedSectionProduct}
                    onSaved={() => {
                      fetchProducts();
                      setOpenSections(false);
                    }}
                  />
                </div>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center">
        {/* PAGE SIZE */}
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>entries</span>
        </div>

        {/* PAGINATION */}
        <div className="flex gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                page === i + 1
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ERROR DETAILS MODAL */}
      {showErrorModal && errorDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex justify-between items-center sticky top-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Import Failed
                  </h3>
                  <p className="text-sm text-red-700">
                    {errorDetails.message || "Please fix the errors below"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorDetails(null);
                }}
                className="text-red-600 hover:text-red-800 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {/* Error Summary */}
              {errorDetails.errors && Array.isArray(errorDetails.errors) && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-3">
                      Found {errorDetails.errors.length} error(s):
                    </p>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {errorDetails.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-white border border-red-100 rounded"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                              {error.row}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Row {error.row}
                            </p>
                            <p className="text-sm text-red-600 mt-1">
                              {error.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      How to fix:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Review the errors listed above</li>
                      <li>Update your Excel file with the correct data</li>
                      <li>Make sure all required fields are filled</li>
                      <li>Try uploading again</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Raw Error Response (if not structured) */}
              {(!errorDetails.errors ||
                !Array.isArray(errorDetails.errors)) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Error Details:
                  </p>
                  <pre className="text-xs text-gray-700 overflow-x-auto bg-white p-3 rounded border border-gray-200">
                    {JSON.stringify(errorDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorDetails(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorDetails(null);
                  setShowBulkModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Import Products
              </h3>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkError(null);
                  setBulkSuccess(null);
                  setBulkFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Error Alert */}
              {bulkError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <span className="text-red-700 font-medium text-sm">
                      {bulkError}
                    </span>
                  </div>
                  <button
                    onClick={() => setBulkError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {bulkSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-green-700 font-medium text-sm">
                      {bulkSuccess}
                    </span>
                  </div>
                </div>
              )}

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadTemplate}
                  disabled={bulkLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition disabled:opacity-50"
                >
                  {bulkLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  Template
                </button>

                <button
                  onClick={handleDownloadSampleData}
                  disabled={bulkLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition disabled:opacity-50"
                >
                  {bulkLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  Sample Data
                </button>
              </div>

              {/* File Upload Section */}
              <div className="space-y-3 border-t pt-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Upload Excel File
                </label>

                {/* File Input with Custom Styling */}
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      setBulkFile(e.target.files?.[0] || null);
                      setBulkError(null);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <Upload size={20} className="text-gray-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {bulkFile
                          ? bulkFile.name
                          : "Choose file or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bulkFile
                          ? `${(bulkFile.size / 1024).toFixed(2)} KB`
                          : ".xlsx, .xls, .csv"}
                      </p>
                    </div>
                  </label>
                </div>

                {/* File Info */}
                {bulkFile && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✓</span>
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {bulkFile.name}
                        </p>
                        <p className="text-xs text-green-700">
                          {(bulkFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setBulkFile(null)}
                      className="text-green-600 hover:text-green-800 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* View Uploaded Data */}
              {uploadedData && (
                <button
                  onClick={() => setShowViewModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 font-medium transition"
                >
                  <Eye size={18} />
                  View Uploaded Data
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkError(null);
                  setBulkSuccess(null);
                  setBulkFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bulkLoading && <Loader size={16} className="animate-spin" />}
                {bulkLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW UPLOADED DATA MODAL */}
      {showViewModal && uploadedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploaded Products
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(uploadedData) &&
                      uploadedData.map((item, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {item.name || item.product_name || "-"}
                          </td>
                          <td className="px-4 py-2">{item.category || "-"}</td>
                          <td className="px-4 py-2">₹{item.price || "-"}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Imported
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWERS */}
      <AddProductDrawer
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          fetchProducts(); // 🔥 refresh list
        }}
      />

      <EditProductDrawer
        open={openEdit}
        product={selectedProduct} // FULL PRODUCT
        productId={selectedProduct?.id}
        onClose={() => {
          setOpenEdit(false);
          setSelectedProduct(null);
          fetchProducts();
        }}
      />
    </div>
  );
}
