import { useEffect, useState,useRef } from "react";
import CategoryPills from "./components/CategoryPills";
import ProductCard from "./components/ProductCard";
import CartPanel from "./CartPanel";
import VariationModal from "./components/VariationModal";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "../pages/components/AccessDenied";
import { showErrorToast, showSuccessToast } from "../utils/swal";

export default function POS() {

    const { can } = useAuth();

  const barcodeInputRef = useRef(null);
const [barcode, setBarcode] = useState("");

  const [openSearch, setOpenSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [category, setCategory] = useState("all");

  const [cart, setCart] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = (products || []).slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /* ================= LOAD CATEGORIES ================= */


  useEffect(() => {
  barcodeInputRef.current?.focus();
}, []);




const searchByBarcode = async (code) => {
  try {

    const res = await api.get(
      `/admin-dashboard/product/product-by-barcode/${code}`
    );

    const product = res.data;
    const variant = product.variants[0];

    console.log("Product found by barcode:", variant);
    const productData = {
      id: product.id,
      name: product.name,
        tax: product.tax
    };

    setSelectedProduct(productData);

    
    addVariantToCart(productData, variant);

  } catch (err) {

    // 🔴 Handle barcode not found
    if (err.response?.data?.message === "Barcode not found") {
      showErrorToast("Barcode not found");
      return;
    }

    // Other errors
    showErrorToast("Something went wrong");
    console.error(err);
  }
};


const addVariantToCart = (product, variant) => {



    console.log("Variant data:", variant.MRP, variant.price, variant.discount);
  if (variant.stock <= 0) {
    showErrorToast("Out of stock");
    return;
  }

  setCart((prev) => {
    const index = prev.findIndex(
      (i) =>
        i.product_id === product.id &&
        i.variation_id === variant.id
    );

    if (index !== -1) {
      if (prev[index].qty >= variant.stock) {
        showErrorToast("Stock limit reached");
        return prev;
      }

      const updated = [...prev];
      updated[index].qty += 1;
      return updated;
    }

    return [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        variation_id: variant.id,
        variation_name: variant.name,
        price: variant.price,
        MRP: variant.MRP,
        discount: variant.discount,
        stock: variant.stock,
        qty: 1,
          tax: product.tax
      },
    ];
  });
};



const handleBarcodeKeyDown = (e) => {
  if (e.key === "Enter") {
    const code = e.target.value.trim();

    if (!code) return;

    searchByBarcode(code);
    setBarcode("");

    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  }
};


  useEffect(() => {
    api
      .get("/admin-dashboard/list-category-all")
      .then((r) => setCategories(r.data.data))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  /* ================= LOAD PRODUCTS ================= */
  // useEffect(() => {
  //   setCurrentPage(1); // Reset to first page when category changes
  //   api
  //     .get("/admin-dashboard/pos-products", {
  //       params: { category }, // removed brand
  //     })
  //     .then((r) => setProducts(r.data.data))
  //     .catch((err) => console.error("Product fetch error:", err));
  // }, [category]);

  useEffect(() => {
  setCurrentPage(1);

  console.log("Selected Category:", category); // ✅ log category

  api
    .get("/admin-dashboard/pos-products", {
      params: { category },
    })
    .then((r) => {
      console.log("API Response:", r); // full response
      console.log("Products Data:", r.data.data); // actual data

      setProducts(r.data.data);
    })
    .catch((err) => {
      console.error("Product fetch error:", err);

      if (err.response) {
        console.error("Error Response:", err.response.data);
      }
    });
}, [category]);

  /* ================= OPEN VARIATION MODAL ================= */
  const handleProductClick = (product) => {
    console.log("Product clicked:", { product });
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleSearch = async (value) => {
    setSearchText(value);

    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await api.get("/admin-dashboard/pos-products-search", {
        params: { search: value },
      });

      setSearchResults(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showErrorToast("Cart is empty");
      return;
    }

    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_combination_id: item.variation_id,
          quantity: item.qty,
        })),
        payment_method: "cash",
        paid_amount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        customer_name: "Walk-in Customer",
      };

      const res = await api.post("/admin-dashboard/create-order", payload);

      showSuccessToast("Order placed successfully");

      // Clear cart
      setCart([]);

      // Refresh products (stock updated)
      const refresh = await api.get("/admin-dashboard/pos-products", {
        params: { category },
      });

      setProducts(refresh.data.data);
    } catch (error) {
      console.error(error);
      showErrorToast(error.response?.data?.message || "Order failed");
    }
  };

  /* ================= ADD VARIANT TO CART ================= */
  const handleAddVariantss = (variant) => {
    if (!selectedProduct) return;

    if (variant.stock <= 0) {
      showErrorToast("Out of stock");
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (i) =>
          i.product_id === selectedProduct.id && i.variation_id === variant.id,
      );

      // Already in cart → increase qty
      if (index !== -1) {
        if (prev[index].qty >= variant.stock) {
          showErrorToast("Stock limit reached");
          return prev;
        }

        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      // Add new item
      return [
        ...prev,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          variation_id: variant.id,
          variation_name: variant.name,
          price: variant.price,
           MRP: variant.MRP,
           discount: variant.discount,
          stock: variant.stock,
          qty: 1,
        },
      ];
    });

    setOpenModal(false);
  };

  const handleAddVariant = (product, variant) => {
  if (!product) return;

  if (variant.stock <= 0) {
    showErrorToast("Out of stock");
    return;
  }

  setCart((prev) => {
    const index = prev.findIndex(
      (i) =>
        i.product_id === product.id &&
        i.variation_id === variant.id
    );

    // Already in cart → increase qty
    if (index !== -1) {
      if (prev[index].qty >= variant.stock) {
        showErrorToast("Stock limit reached");
        return prev;
      }

      const updated = [...prev];
      updated[index].qty += 1;
      return updated;
    }

    // Add new item
    return [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,

        variation_id: variant.id,
        variation_name: variant.name,

        // 🔥 FIX HERE
        price: Number(variant.price) || 0,
        mrp: Number(variant.MRP) || 0,
        discount: Number(variant.discount) || 0,

        stock: Number(variant.stock) || 0,
        qty: 1,

        tax: product.tax, // 🔥 IMPORTANT
      },
    ];
  });

  setOpenModal(false);
};


     if (!can("pos.view")) {
    return (
      <AccessDenied />
    );
  }



  return (


    
    <div className="flex h-screen overflow-hidden bg-slate-100">



      {/* LEFT PANEL */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50/40 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Offline POS Terminal</h1>
              <p className="text-sm text-slate-500">
                Fast billing, barcode-ready checkout, and touch-friendly product selection.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                Products: {products.length}
              </span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Cart items: {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <CategoryPills
            items={categories}
            active={category}
            onChange={setCategory}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            onClick={() => setOpenSearch(true)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Search Product
          </button>

  {
    can("pos.barcode_search") && (


<input
  ref={barcodeInputRef}
  value={barcode}
  onChange={(e)=>setBarcode(e.target.value)}
  onKeyDown={handleBarcodeKeyDown}
  placeholder="Scan barcode and press Enter..."
  className="h-10 w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
  autoFocus
/>

)
}


</div>

        {/* PRODUCTS GRID */}
        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {paginatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => handleProductClick(p)}
            />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ◀ Prev
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === i + 1
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>


     

      {openSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Search Product</h2>

              <button
                onClick={() => setOpenSearch(false)}
                className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search product..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            {/* <div className="max-h-[300px] overflow-y-auto">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleProductClick(p);
                    setOpenSearch(false);
                  }}
                  className="p-2 border-b cursor-pointer hover:bg-gray-100"
                >
                  {p.name}
                </div>
              ))}
            </div> */}

            <div className="max-h-[300px] overflow-y-auto">
  {searchResults.map((p) => (
    <div
      key={p.id}
      onClick={() => {
        handleProductClick(p);
        setOpenSearch(false);
      }}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        {/* IMAGE (optional) */}
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            className="w-10 h-10 rounded object-cover"
          />
        )}

        <div>
          {/* NAME */}
          <p className="font-medium text-sm text-gray-800">
            {p.name}
          </p>

          {/* VARIANT COUNT */}
          <p className="text-xs text-gray-500">
            {p.variants?.length || 0} variants
          </p>

          {/* GST TAG */}
          {p.tax?.gst_enabled &&
            p.tax?.gst_type === "exclusive" && (
              <p className="text-[10px] text-green-600">
                + GST {p.tax.gst_percent}%
              </p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE (PRICE) */}
      <div className="text-right">
        {(() => {
          const v = p.variants?.[0];
          const price = Number(v?.price) || 0;
          const mrp = Number(v?.MRP) || 0;
          const gstPercent = Number(p.tax?.gst_percent) || 0;

          const finalPrice =
            p.tax?.gst_enabled && p.tax?.gst_type === "exclusive"
              ? price + (price * gstPercent) / 100
              : price;

          return (
            <>
              {/* MRP */}
              {mrp > 0 && (
                <p className="text-xs text-gray-400 line-through">
                  ₹ {mrp}
                </p>
              )}

              {/* FINAL PRICE */}
              <p className="text-sm font-semibold text-green-700">
                ₹ {finalPrice.toFixed(2)}
              </p>
            </>
          );
        })()}
      </div>
    </div>
  ))}
</div>
          </div>
        </div>
      )}

      {/* CART PANEL */}
      <CartPanel cart={cart} setCart={setCart} onCheckout={handleCheckout} />

      {/* VARIATION MODAL */}
      <VariationModal
        open={openModal}
        product={selectedProduct}
        onClose={() => setOpenModal(false)}
        onConfirm={handleAddVariant}
      />
    </div>
  );
}
