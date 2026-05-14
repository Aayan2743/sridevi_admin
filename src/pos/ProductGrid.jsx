import ProductCard from "./ProductCard";

const PRODUCTS = [
  {
    id: 1,
    name: "Herbal Hair Pack",
    price: 120,
    image: "/product.png",
    variations: {
      size: ["50g", "100g", "200g"],
      type: ["Normal", "Strong"],
    },
  },
  {
    id: 2,
    name: "Chandamama Bath Powder",
    price: 60,
    image: "/product.png",
    variations: {
      size: ["100g", "250g"],
    },
  },
];

export default function ProductGrid({ onSelect }) {
  return (
    <>
      {/* CATEGORY TABS */}
      <div className="flex gap-2 mb-4">
        {["All", "Hair", "Skin", "Powder"].map((c) => (
          <button
            key={c}
            className="px-4 py-2 rounded-full border bg-white hover:bg-green-50"
          >
            {c}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.id} product={p} onClick={onSelect} />
        ))}
      </div>
    </>
  );
}
