import { useEffect, useState } from "react";
// Using mock UI only: remove external API/drawer dependencies and provide
// lightweight local stubs + mock data generation below.
import { useAuth } from "../auth/AuthContext";
// import AddProductDrawer from "./components/AddProductDrawer";

import {
  confirmAction,
  showErrorToast,
  showSuccessToast,
  showLoader,
  closeLoader,
} from "../utils/swal";

export default function PosProducts() {
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionProduct, setSectionProduct] = useState(null);
  const [sections, setSections] = useState([]);
  const { can } = useAuth();

  // 🔥 STATES
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [showStoreOnly, setShowStoreOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [openAdd, setOpenAdd] = useState(false);
  const [openAddStoreStock, setOpenAddStoreStock] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openEditStoreStock, setOpenEditStoreStock] = useState(false);
  const [selectedStoreStock, setSelectedStoreStock] = useState(null);

  const [columnOpen, setColumnOpen] = useState(false);

  const parseStockValue = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  const hasStoreStock = (product) => {
    if (!product) return false;
    if (
      Array.isArray(product.variantCombinations) &&
      product.variantCombinations.length
    ) {
      return product.variantCombinations.some(
        (variant) =>
          parseStockValue(variant.stock ?? variant.quantity ?? variant.qty) > 0,
      );
    }

    return (
      parseStockValue(product.store_stock) > 0 ||
      parseStockValue(product.stock) > 0 ||
      parseStockValue(product.quantity) > 0 ||
      parseStockValue(product.total_stock) > 0 ||
      parseStockValue(product.available_stock) > 0 ||
      parseStockValue(product.qty) > 0
    );
  };

  const filteredProducts = showStoreOnly
    ? products.filter(hasStoreStock)
    : products;
  const totalProducts = filteredProducts.length;

  // 🔥 COLUMN CONFIG
  const defaultColumns = [
    "id",
    "image",
    "name",
    "category",
    "price",
    "stock",
    "status",
    "sections",
    "action",
  ];

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("product_columns");
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  const toggleColumn = (col) => {
    let updated;
    if (visibleColumns.includes(col)) {
      updated = visibleColumns.filter((c) => c !== col);
    } else {
      updated = [...visibleColumns, col];
    }
    setVisibleColumns(updated);
    localStorage.setItem("product_columns", JSON.stringify(updated));
  };

  const getStoreStock = (product) => {
    if (!product) return "-";

    const stockCandidates = [
      product.store_stock,
      product.stock,
      product.quantity,
      product.total_stock,
      product.available_stock,
      product.qty,
    ];

    if (
      Array.isArray(product.variantCombinations) &&
      product.variantCombinations.length
    ) {
      const totalVariantStock = product.variantCombinations.reduce(
        (sum, variant) =>
          sum + Number(variant.stock ?? variant.quantity ?? variant.qty ?? 0),
        0,
      );
      if (totalVariantStock > 0) return totalVariantStock.toLocaleString();
    }

    const stockValue = stockCandidates.find(
      (value) => value !== undefined && value !== null && value !== "",
    );
    return stockValue !== undefined ? String(stockValue) : "-";
  };

  // 🔥 CLOSE DROPDOWN
  useEffect(() => {
    const close = () => setColumnOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const close = () => setAddMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    // load mock sections for POS UI
    setSections([
      { id: 1, name: "Featured" },
      { id: 2, name: "Bestseller" },
      { id: 3, name: "New Arrivals" },
    ]);
  }, []);

  // 🔥 FETCH API
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // generate mock product list (25 items)
      const all = Array.from({ length: 25 }, (_, i) => {
        const id = i + 1;
        return {
          id,
          name: `POS Product ${id}`,
          image_url: `https://via.placeholder.com/80?text=${id}`,
          final_price: (100 + i * 5).toFixed(2),
          category_name: "Mock Category",
          status: i % 4 === 0 ? "inactive" : "active",
          store_stock: i % 5 === 0 ? 0 : (i % 7) + 1,
          quantity: (i % 7) + 1,
          variants: [],
          sections: i % 3 === 0 ? [{ id: 1, name: "Featured" }] : [],
        };
      });

      // apply search filter
      let list = all.filter((p) =>
        String(p.name).toLowerCase().includes(String(query).toLowerCase()),
      );

      if (showStoreOnly) list = list.filter(hasStoreStock);

      const total = list.length;
      setTotalPages(Math.max(1, Math.ceil(total / perPage)));

      const start = (page - 1) * perPage;
      const pageItems = list.slice(start, start + perPage);
      setProducts(pageItems);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to load products (mock)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query, page, perPage]);

  // 🔥 HANDLERS
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
  };

  const handleEditStoreStock = (product) => {
    setSelectedStoreStock(product);
    setOpenEditStoreStock(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmAction("Delete this product?");
    if (!confirmed) return;
    // operate on local mock data
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showSuccessToast("Product deleted (mock)");
  };

  if (!can("product.view")) return <div>No Access</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="w-full space-y-6">
        {/* 🔥 HEADER */}
        <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50" />
          <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between md:p-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700 shadow-sm">
                Product catalog
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Products
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Manage your catalog with faster search, cleaner controls, and
                  a more polished overview of product status and sections.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
              <MetricCard
                label="Loaded"
                value={String(totalProducts).padStart(2, "0")}
              />
              <MetricCard label="Page" value={`${page}/${totalPages}`} />
              <MetricCard
                label="Visible cols"
                value={String(visibleColumns.length)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Search & Filters
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Find products quickly, customize the table view, or create a new
                product.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="flex min-w-[280px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <span className="mr-3 text-slate-400">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setQuery(search);
                      setPage(1);
                    }
                  }}
                  placeholder="Search by product name..."
                  className="h-12 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={() => {
                  setQuery(search);
                  setPage(1);
                }}
                className="h-12 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Search
              </button>

              <button
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setShowStoreOnly(false);
                  setPage(1);
                }}
                className="h-12 rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowStoreOnly((prev) => !prev);
                  setPage(1);
                }}
                className={`h-12 rounded-2xl px-5 text-sm font-semibold transition ${
                  showStoreOnly
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {showStoreOnly ? "Store items only" : "Show store items"}
              </button>

              {/* 🔥 ADD */}
              {can("product.add") && (
                <div>
                  <button
                    onClick={() => setOpenAddStoreStock(true)}
                    className="h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-400 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.18)] transition hover:scale-[1.01]"
                  >
                    + Add POS Product
                  </button>
                </div>
              )}

              {/* 🔥 COLUMN TOGGLE */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setColumnOpen(!columnOpen);
                  }}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Columns
                </button>

                {columnOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-14 z-50 w-60 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl"
                  >
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Visible Columns
                    </p>
                    <div className="space-y-2">
                      {defaultColumns.map((col) => (
                        <label
                          key={col}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(col)}
                            onChange={() => toggleColumn(col)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="capitalize">{col}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 TABLE */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Product List
                </h3>
                <p className="text-sm text-slate-500">
                  Review products, update status, manage sections, and edit
                  catalog details.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {showStoreOnly
                  ? "Store items only"
                  : query
                    ? `Filtered by "${query}"`
                    : "All products"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="min-w-[1100px] w-full text-sm border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  {visibleColumns.includes("id") && (
                    <th className="px-4">S No</th>
                  )}
                  {visibleColumns.includes("image") && (
                    <th className="px-4">Image</th>
                  )}
                  {visibleColumns.includes("name") && (
                    <th className="px-4">Product</th>
                  )}
                  {visibleColumns.includes("category") && (
                    <th className="px-4">Category</th>
                  )}
                  {visibleColumns.includes("price") && (
                    <th className="px-4">Price</th>
                  )}
                  {visibleColumns.includes("stock") && (
                    <th className="px-4">Stock</th>
                  )}
                  {visibleColumns.includes("status") && (
                    <th className="px-4">Status</th>
                  )}
                  {visibleColumns.includes("sections") && (
                    <th className="px-4">Sections</th>
                  )}
                  {visibleColumns.includes("action") && (
                    <th className="px-4">Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="py-10 text-center"
                    >
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="py-12 text-center"
                    >
                      <div className="mx-auto max-w-md space-y-2">
                        <p className="text-base font-semibold text-slate-700">
                          {showStoreOnly
                            ? "No store products found"
                            : "No products found"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {showStoreOnly
                            ? "Toggle off store-only mode or update stock for existing products."
                            : "Try changing your search or add a new product to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="rounded-2xl bg-slate-50/60 shadow-sm transition hover:bg-white hover:shadow-md"
                    >
                      {visibleColumns.includes("id") && (
                        <td className="px-4 py-4 font-medium text-slate-600">
                          {p.id}
                        </td>
                      )}

                      {visibleColumns.includes("image") && (
                        <td className="px-4 py-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
                          />
                        </td>
                      )}

                      {visibleColumns.includes("name") && (
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              Product ID #{p.id}
                            </p>
                          </div>
                        </td>
                      )}

                      {visibleColumns.includes("category") && (
                        <td className="px-4 py-3 text-slate-600">
                          {p.category_name}
                        </td>
                      )}

                      {visibleColumns.includes("price") && (
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          ₹{p.final_price}
                        </td>
                      )}

                      {visibleColumns.includes("stock") && (
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {getStoreStock(p)}
                        </td>
                      )}

                      {visibleColumns.includes("status") && (
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                      )}

                      {visibleColumns.includes("sections") && (
                        <td className="px-4 py-3 space-y-2">
                          {/* 🔥 BADGES */}
                          <div className="flex flex-wrap gap-1">
                            {p.sections?.slice(0, 2).map((s) => (
                              <span
                                key={s.id}
                                className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                              >
                                {s.name}
                              </span>
                            ))}

                            {p.sections?.length > 2 && (
                              <span className="text-xs text-slate-500">
                                +{p.sections.length - 2} more
                              </span>
                            )}
                          </div>

                          {/* 🔥 MANAGE BUTTON */}
                          <button
                            onClick={async () => {
                              try {
                                showLoader("Loading Sections...");

                                // 🔥 small delay to show loader smoothly (optional but recommended)
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 300),
                                );

                                // 🔥 If you already loaded sections globally → skip API
                                // Otherwise preload (optional)
                                // await api.get("/admin-dashboard/sections");

                                setSectionProduct(p);

                                closeLoader(); // 🔥 CLOSE LOADER
                                setSectionModalOpen(true); // 🔥 OPEN MODAL
                              } catch (err) {
                                closeLoader();
                                showErrorToast("Failed to load sections");
                              }
                            }}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-sm font-medium text-white shadow transition hover:scale-[1.02]"
                          >
                            Manage
                          </button>
                        </td>
                      )}
                      {visibleColumns.includes("action") && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {can("product.edit") && (
                              <button
                                onClick={() => handleEdit(p)}
                                className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                              >
                                Edit
                              </button>
                            )}

                            {hasStoreStock(p) && (
                              <button
                                onClick={() => handleEditStoreStock(p)}
                                className="rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-100"
                              >
                                Edit Stock
                              </button>
                            )}

                            {can("product.delete") && (
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                              >
                                Delete
                              </button>
                            )}

                            {/* 🔥 IMPORTANT (YOU WERE MISSING THIS BEFORE) */}
                            {/* <ProductSectionAssign product={p} /> */}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔥 PAGINATION */}
        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              Rows per page
            </span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next SDS
            </button>
          </div>
        </div>

        {/* 🔥 DRAWERS */}
        {/* <AddProductDrawer open={openAdd} onClose={() => setOpenAdd(false)} /> */}

        <AddProductDrawer
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSaved={(newProduct) => {
            setProducts((prev) => [newProduct, ...prev]); // 🔥 add instantly
          }}
        />

        <AddStoreStockDrawer
          open={openAddStoreStock}
          onClose={() => setOpenAddStoreStock(false)}
          onSaved={(newProduct) => {
            setOpenAddStoreStock(false);
            if (newProduct)
              setProducts((prev) => [newProduct, ...(prev || [])]);
          }}
        />

        <EditStoreStockDrawer
          open={openEditStoreStock}
          product={selectedStoreStock}
          onClose={() => {
            setOpenEditStoreStock(false);
            setSelectedStoreStock(null);
            fetchProducts();
          }}
          onSaved={() => {
            setOpenEditStoreStock(false);
            setSelectedStoreStock(null);
            fetchProducts();
          }}
        />

        {/* <EditProductDrawer
        open={openEdit}
        product={selectedProduct}
        onClose={() => setOpenEdit(false)}
      /> */}

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

        {sectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Manage Sections
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Assign sections for{" "}
                    {sectionProduct?.name || "selected product"}.
                  </p>
                </div>
                <button
                  onClick={() => setSectionModalOpen(false)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <ProductSectionAssign
                product={sectionProduct}
                sections={sections}
                onSaved={(updatedSections) => {
                  setProducts((prev) =>
                    prev.map((item) =>
                      item.id === sectionProduct.id
                        ? { ...item, sections: updatedSections }
                        : item,
                    ),
                  );
                  setSectionModalOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Local lightweight UI stubs for mock-mode ---
function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
    >
      {status}
    </span>
  );
}

function AddProductDrawer() {
  return null;
}

function AddStoreStockDrawer({ open, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("POS Item");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setPrice("");
      setStock("");
      setCategory("POS Item");
      setImageUrl("");
    }
  }, [open]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const id = Date.now();
    const newProduct = {
      id,
      name: name || `POS Product ${id}`,
      image_url:
        imageUrl ||
        `https://via.placeholder.com/80?text=${encodeURIComponent(name || id)}`,
      final_price: Number(price || 0).toFixed(2),
      category_name: category || "POS Item",
      status: "active",
      store_stock: Number(stock || 0),
      quantity: Number(stock || 0),
      variants: [],
      sections: [],
    };

    if (onSaved) onSaved(newProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-[20px] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add POS Product</h3>
          <button type="button" onClick={onClose} className="text-slate-500">
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <label className="text-sm">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Price
            <input
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Stock
            <input
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            Image URL
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

function EditStoreStockDrawer() {
  return null;
}

function EditProductDrawer() {
  return null;
}

function ProductSectionAssign({ product, sections, onSaved }) {
  const [selected, setSelected] = useState(product?.sections || []);

  useEffect(() => setSelected(product?.sections || []), [product]);

  const toggle = (s) => {
    if (selected?.some((x) => x.id === s.id))
      setSelected((prev) => prev.filter((x) => x.id !== s.id));
    else setSelected((prev) => [...(prev || []), s]);
  };

  return (
    <div>
      <div className="space-y-3">
        {sections.map((s) => (
          <label key={s.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!selected?.some((x) => x.id === s.id)}
              onChange={() => toggle(s)}
            />
            <span className="text-sm">{s.name}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onSaved(selected)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
