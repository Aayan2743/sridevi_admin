import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ManualOrders1() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("");

  const [dimensions, setDimensions] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [page, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // const res = await api.get(
      //   `/admin-dashboard/calling/orders?page=${page}&search=${search}`,
      // );

          const res = await api.get(
        `/admin-dashboard/calling/employees/orders?page=${page}&search=${search}`,
      );

      if (res.data.success) {
        setOrders(res.data.data.data);
        setLastPage(res.data.data.last_page);
      }
    } catch {
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const openCourierModal = async (order) => {
    setSelectedOrder(order);
    setShowCourierModal(true);

    try {
      const res = await api.get("/admin-dashboard/enabled-couriers");

      if (res.data.success) {
        setCouriers(res.data.data);
      }
    } catch {
      alert("Failed to load couriers");
    }
  };

  const submitCourier = async () => {
    if (!selectedCourier) {
      alert("Please select courier");
      return;
    }

    try {
      const res = await api.post(
        `/admin-dashboard/send-courier/${selectedOrder.id}`,
        {
          courier: selectedCourier,
          ...dimensions,
        },
      );

      if (res.data.success) {
        alert("Sent to courier successfully");
        setShowCourierModal(false);
        fetchOrders();
      }
    } catch {
      alert("Courier failed");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      created: "bg-yellow-100 text-yellow-600",
      shipped: "bg-blue-100 text-blue-600",
      completed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manual Orders</h2>

      <input
        type="text"
        placeholder="Search invoice, name, phone..."
        className="border p-2 rounded w-1/3 mb-4"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3">{order.invoice_number}</td>
                <td className="p-3">{order.customer_name}</td>
                <td className="p-3">{order.customer_phone}</td>
                <td className="p-3">₹ {order.grand_total}</td>
                <td className="p-3">{getStatusBadge(order.status)}</td>
                <td className="p-3">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                 <td className="p-3">
                  {order?.user?.name || "N/A"}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/calling/order/${order.id}`)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    View
                  </button>

                  {/* {order.status === "created" && (
                    <button
                      onClick={() => openCourierModal(order)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Courier
                    </button>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-semibold mb-4">
              Select Courier & Dimensions
            </h3>

            <select
              className="border p-2 rounded w-full mb-3"
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
            >
              <option value="">Select Courier</option>
              {couriers.map((courier) => (
                <option key={courier.code} value={courier.code}>
                  {courier.name}
                </option>
              ))}
            </select>

            {["length", "breadth", "height", "weight"].map((field) => (
              <input
                key={field}
                type="number"
                placeholder={field}
                className="border p-2 rounded w-full mb-3"
                value={dimensions[field]}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    [field]: e.target.value,
                  })
                }
              />
            ))}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCourierModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={submitCourier}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
