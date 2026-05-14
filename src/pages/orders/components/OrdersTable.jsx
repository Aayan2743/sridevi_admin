import { useState } from "react";

const PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15",
    category: "Electronics",
    brand: "Apple",
    price: 25000,
    status: "Active",

    // 👇 required for edit wizard
    basic: {
      name: "iPhone 15",
      category: "Electronics",
      brand: "Apple",
      price: 25000,
    },
    gallery: [],
    variations: [],
    meta: {},
    tax: { gst: 18 },
  },
  {
    id: 2,
    name: "Galaxy S23",
    category: "Electronics",
    brand: "Samsung",
    price: 22000,
    status: "Inactive",

    basic: {
      name: "Galaxy S23",
      category: "Electronics",
      brand: "Samsung",
      price: 22000,
    },
    gallery: [],
    variations: [],
    meta: {},
    tax: { gst: 18 },
  },
  {
    id: 3,
    name: "MacBook Air",
    category: "Laptop",
    brand: "Apple",
    price: 75000,
    status: "Active",

    basic: {
      name: "MacBook Air",
      category: "Laptop",
      brand: "Apple",
      price: 75000,
    },
    gallery: [],
    variations: [],
    meta: {},
    tax: { gst: 18 },
  },
];

export default function ProductTable({ onEdit }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 5;

  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="input max-w-xs"
      />

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p, i) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{(page - 1) * perPage + i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{p.brand}</td>
                <td className="px-4 py-3">₹{p.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-3">
        {data.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.status}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              {p.category} • {p.brand}
            </p>

            <div className="flex justify-between items-center">
              <span className="font-medium">₹{p.price}</span>
              <button
                onClick={() => onEdit(p)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
