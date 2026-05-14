import { useState, useMemo } from "react";
import OrderViewDrawer from "./components/OrderViewDrawer";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [viewOrder, setViewOrder] = useState(null);

  const orders11 = [
    {
      id: 1,
      order_no: "ORD-1001",
      customer: "Rahul",
      mobile: "9876543210",
      payment: "Online",
      amount: "₹1,250",
      status: "Pending",
      products: [
        { image: "/img/iphone1.jpg" },
        { image: "/img/iphone2.jpg" },
      ],
    },
    {
      id: 2,
      order_no: "ORD-1002",
      customer: "Anita",
      mobile: "9123456780",
      payment: "Online",
      amount: "₹890",
      status: "Confirmed",
      products: [{ image: "/img/galaxy.jpg" }],
    },
    {
      id: 3,
      order_no: "ORD-1003",
      customer: "Vikram",
      mobile: "9988776655",
      payment: "COD",
      amount: "₹2,200",
      status: "Shipped",
      products: [],
    },
  ];


  const orders = {
  1: {
    id: 1,
    order_no: "ORD-1001",
    date: "20 Jan 2025",
    customer: "Rahul",
    mobile: "9876543210",
    payment: "Online (Razorpay)",
    amount: 1250,
    status: "Pending",

    items: [
      {
        id: 1,
        name: "iPhone 15",
        image: "/img/iphone1.jpg",
        variant: "128GB • Black",
        price: 25000,
        qty: 1,
      },
      {
        id: 2,
        name: "iPhone Case",
        image: "/img/iphone2.jpg",
        variant: "Transparent",
        price: 500,
        qty: 1,
      },
    ],
  },

  2: {
    id: 2,
    order_no: "ORD-1002",
    date: "19 Jan 2025",
    customer: "Anita",
    mobile: "9123456780",
    payment: "Online",
    amount: 890,
    status: "Confirmed",

    items: [
      {
        id: 3,
        name: "Samsung Galaxy S23",
        image: "/img/galaxy.jpg",
        variant: "256GB • Cream",
        price: 890,
        qty: 1,
      },
    ],
  },

  3: {
    id: 3,
    order_no: "ORD-1003",
    date: "18 Jan 2025",
    customer: "Vikram",
    mobile: "9988776655",
    payment: "Cash on Delivery",
    amount: 2200,
    status: "Shipped",

    shipping: {
      provider: "Delhivery",
      trackingNo: "DEL123456789",
      trackingUrl: "https://www.delhivery.com/track/DEL123456789",
    },

    items: [],
  },
};



  /* 🔍 SEARCH */
  const filtered = useMemo(() => {
    return orders.filter(
      (o) =>
        o.order_no.toLowerCase().includes(query.toLowerCase()) ||
        o.customer.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filtered.length / perPage);
  const data = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Orders</h1>

        <div className="flex gap-2">
          <input
            placeholder="Search order..."
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
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Products</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <OrderProductImages products={o.products} />
                </td>
                <td className="px-4 py-3 font-medium">
                  {o.order_no}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p>{o.customer}</p>
                    <p className="text-xs text-gray-500">{o.mobile}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{o.payment}</td>
                <td className="px-4 py-3">{o.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      o.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : o.status === "Confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setViewOrder(o)}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center">
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

      {/* VIEW DRAWER */}
      {viewOrder && (
        <OrderViewDrawer
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}
    </div>
  );
}

/* ================= ORDER PRODUCT IMAGES ================= */

function OrderProductImages({ products = [] }) {
  const images = products.map((p) => p.image).filter(Boolean);

  if (!images.length) {
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
        No Img
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt=""
        className="w-10 h-10 rounded-lg object-cover border"
      />
    );
  }

  return (
    <div className="flex -space-x-2">
      {images.slice(0, 2).map((img, i) => (
        <img
          key={i}
          src={img}
          alt=""
          className="w-9 h-9 rounded-full object-cover border-2 border-white"
        />
      ))}

      {images.length > 2 && (
        <div className="w-9 h-9 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white">
          +{images.length - 2}
        </div>
      )}
    </div>
  );
}
