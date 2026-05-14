import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";
export default function ManualOrders() {
  const navigate = useNavigate();

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);

const [ratePage, setRatePage] = useState(1);
const ratePerPage = 5;

const [showRateModal, setShowRateModal] = useState(false);
const [rates, setRates] = useState([]);
const [rateLoading, setRateLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [courierLoading, setCourierLoading] = useState(false);

  const [dimensions, setDimensions] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [page, search, filterStatus, filterType]);




const fetchRates = async (order) => {

  console.log("Fetching rates for order ID:", order);
  try {
   setError(null);  
    setSelectedOrder(order);  
    setRateLoading(true);
    setShowRateModal(true);

    const res = await api.post("/admin-dashboard/rate-card", {
      order_id: order.id
    });

    if (!res.data.success) {
      setError(res.data.message);
      setRates([]);
      return;
    }

    setRates(res.data.data.data || []);

  } catch (err) {

    setError(err.response?.data?.message || "Failed to fetch courier rates");

  } finally {

    setRateLoading(false);

  }
};

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/admin-dashboard/calling/orders?page=${page}&search=${search}`;
      
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      console.log("Fetching from URL:", url);

      const res = await api.get(url);

      if (res.data.success) {
        let filteredData = res.data.data.data;

        // Client-side filtering for customer type
        if (filterType) {
          filteredData = filteredData.filter((order) => {
            const isWalkIn = !order.shipping_address_snapshot?.address;
            if (filterType === "walk-in") {
              return isWalkIn;
            } else if (filterType === "on-call") {
              return !isWalkIn;
            }
            return true;
          });
        }

        setOrders(filteredData);
        setLastPage(res.data.data.last_page);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const isNormalCustomer = (order) => {
    return !order.shipping_address_snapshot?.address;
  };

  const openCourierModal = async (order) => {
    if (isNormalCustomer(order)) {
      setError("Cannot send courier for walk-in customers");
      return;
    }

    setSelectedOrder(order);
    setShowCourierModal(true);
    setDimensions({ length: "", breadth: "", height: "", weight: "" });

    try {
      setCourierLoading(true);
      const res = await api.get("/admin-dashboard/enabled-couriers");

      if (res.data.success) {
        setCouriers(res.data.data);
      } else {
        setError("Failed to load couriers");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load couriers");
    } finally {
      setCourierLoading(false);
    }
  };

  const submitCourier = async () => {
    if (!selectedCourier) {
      setError("Please select a courier");
      return;
    }

    if (!dimensions.length || !dimensions.breadth || !dimensions.height || !dimensions.weight) {
      setError("Please fill all dimension fields");
      return;
    }

    try {
      setCourierLoading(true);
      setError(null);

      const res = await api.post(
        `/admin-dashboard/send-courier/${selectedOrder.id}`,
        {
          courier: selectedCourier,
          ...dimensions,
        },
      );

      if (res.data.success) {
        setSuccess("Courier assigned successfully");
        setShowCourierModal(false);
        setSelectedCourier("");
        fetchOrders();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.data.message || "Failed to assign courier");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign courier");
    } finally {
      setCourierLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      created: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      shipped: "bg-blue-100 text-blue-700 border border-blue-300",
      completed: "bg-green-100 text-green-700 border border-green-300",
      cancelled: "bg-red-100 text-red-700 border border-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-700 border border-gray-300"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // const getCustomerTypeBadge = (order) => {
  //   const isNormal = isNormalCustomer(order);
  //   return (
  //     <span
  //       className={`px-3 py-1 rounded-full text-xs font-semibold ${
  //         isNormal
  //           ? "bg-purple-100 text-purple-700 border border-purple-300"
  //           : "bg-cyan-100 text-cyan-700 border border-cyan-300"
  //       }`}
  //     >
  //       {isNormal ? "Walk-in" : "On-Call"}
  //     </span>
  //   );
  // };


  const getCustomerTypeBadge = (order) => {

  const type = order?.order_from;

  let label = "N/A";
  let style = "bg-gray-100 text-gray-600 border border-gray-300";

  if (type === "whatsapp") {
    label = "WhatsApp";
    style = "bg-green-100 text-green-700 border border-green-300";
  }

  if (type === "On-Call") {
    label = "On-Call";
    style = "bg-cyan-100 text-cyan-700 border border-cyan-300";
  }

  if (type === "walk-in") {
    label = "Walk-in";
    style = "bg-purple-100 text-purple-700 border border-purple-300";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
};

const shipNow = async (orderId, courierId) => {


  // alert("Shipping with courier ID: " + orderId);

  // return;
  try {

    const res = await api.post("/admin-dashboard/assign-courier", {
      order_id: orderId,
      courier_id: courierId
    });

    if (res.data.success) {

      setSuccess("Courier assigned successfully");
      setShowRateModal(false);
      fetchOrders();

    } else {

      setError(res.data.message);

    }

  } catch (err) {

    console.log(err.response?.data);

    setError(
      err.response?.data?.message ||
      "Failed to assign courier"
    );

  }

};


const resetCourier = async (orderId) => {

  try {

    const res = await api.post(`/admin-dashboard/reset-courier/${orderId}`);

    if(res.data.success){

      setSuccess("Courier removed successfully");

      fetchOrders();

    }

  } catch (err){

    setError("Failed to remove courier");

  }

};


const cancelOrder = async (orderId) => {
  try {

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const res = await api.post(`/admin-dashboard/cancel-courier/${orderId}`);

    if (res.data.success) {
      setSuccess("Order cancelled successfully");
      fetchOrders();
    } else {
      setError(res.data.message);
    }

  } catch (err) {
    setError("Cancel failed");
  }
};

const indexOfLastRate = ratePage * ratePerPage;
const indexOfFirstRate = indexOfLastRate - ratePerPage;

const currentRates = rates.slice(indexOfFirstRate, indexOfLastRate);

const totalRatePages = Math.ceil(rates.length / ratePerPage);



  if (!can("pos_orders.view")) {
    return (
      <AccessDenied />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manual Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track walk-in and on-call orders, assign couriers, and monitor shipment progress.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <span className="text-green-700 font-medium">{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800 text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by invoice, name, or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-max">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setFilterStatus(e.target.value);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All Status</option>
            <option value="created">Created</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Customer Type Filter */}
        <div className="min-w-max">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
          <select
            value={filterType}
            onChange={(e) => {
              setPage(1);
              setFilterType(e.target.value);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="">All Types</option>
            <option value="walk-in">Walk-in</option>
            <option value="on-call">On-Call</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || filterStatus || filterType) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterStatus("");
              setFilterType("");
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
          >
            Clear
          </button>
        )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-12 shadow-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-600">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Invoice</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-900">{order.invoice_number}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customer_name}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customer_phone}</td>
                    <td className="px-4 py-3">{getCustomerTypeBadge(order)} </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">₹ {parseFloat(order.paid_amount).toFixed(2)}</td>
                    {/* <td className="px-4 py-3">{getStatusBadge(order.status)} </td> */}


                    <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(order.status)}

                      {order.tracking_number && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Tracking:</span> {order.awb_no}
                        </div>
                      )}

                      {order.shipping_partner && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Partner:</span> {order.shipping_partner}
                        </div>
                      )}
                    </div>
                  </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order?.user?.name || "—"}</td>
                    <td className="px-4 py-3 flex gap-2">

  <button
    onClick={() => navigate(`/calling/order/${order.id}`)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
  >
    View
  </button>

  {/* Step 1: Send courier */}
{order.status === "created" && !isNormalCustomer(order) && 
  can("pos_orders.courier") && (
    <button
      onClick={() => openCourierModal(order)}
    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
    >
      Courier
    </button>
)}

  {/* Step 2: After shipped show rate card */}


{order.status === "shipped" &&
  !order.awb_no &&
  can("pos_orders.ratecard") && (
    <button
      onClick={() => fetchRates(order)}
    className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-violet-700"
    >
      Rate Card
    </button>
)}

  {/* {order.status === "shipped" && !order.awb_no &&  (
  <button
    onClick={() => resetCourier(order.id)}
    className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-600"
  >
    Change Courier
  </button>
)} */}


{order.status === "shipped" &&
  !order.awb_no &&
  can("pos_orders.change_courier") && (
    <button
      onClick={() => resetCourier(order.id)}
      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs"
    >
      Change Courier
    </button>
)}

  {order.status === "shipped" && order.awb_no &&  (
  <button
    onClick={() => cancelOrder(order.id)}
    className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-600"
  >
    Cancel Order 
  </button>
)}

</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="mb-2 text-xl font-semibold text-slate-900">No Orders Found</h3>
          <p className="text-slate-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  page === p
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Courier Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-r from-white to-indigo-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Assign Courier</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select a courier partner and package dimensions to continue shipping.
                </p>
              </div>
              <button
                onClick={() => setShowCourierModal(false)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-5">
              {/* Courier Selection */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Courier
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  disabled={courierLoading}
                >
                  <option value="">
                    {courierLoading ? "Loading couriers..." : "Choose a courier"}
                  </option>
                  {couriers.map((courier) => (
                    <option key={courier.code} value={courier.code}>
                      {courier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensions */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Package Dimensions
                </label>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {[
                    { key: "length", label: "Length (cm)" },
                    { key: "breadth", label: "Breadth (cm)" },
                    { key: "height", label: "Height (cm)" },
                    { key: "weight", label: "Weight (kg)" },
                  ].map(({ key, label }) => (
                    <input
                      key={key}
                      type="number"
                      placeholder={label}
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      value={dimensions[key]}
                      onChange={(e) =>
                        setDimensions({
                          ...dimensions,
                          [key]: e.target.value,
                        })
                      }
                      disabled={courierLoading}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setShowCourierModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                disabled={courierLoading}
              >
                Cancel
              </button>

              <button
                onClick={submitCourier}
                className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={courierLoading}
              >
                {courierLoading ? "Assigning..." : "Assign Courier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">

      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Courier Rate Card</h3>
        <button onClick={() => setShowRateModal(false)}>✕</button>
      </div>

      <div className="p-6">

        {rateLoading && (
          <div className="text-center py-10">Loading courier rates...</div>
        )}

          {error && (
  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
    {error}
  </div>
)}

        {!rateLoading && (



          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Courier Partner</th>
                <th className="px-4 py-3 text-left">Estimated Delivery</th>
                <th className="px-4 py-3 text-left">Chargeable Weight</th>
                <th className="px-4 py-3 text-left">Charges</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRates.map((courier) => (
                <tr key={courier.id} className="border-b">

                  <td className="px-4 py-4 flex items-center gap-3">
                    <img src={courier.image} className="w-10 h-10 object-contain"/>
                    <div>
                      <div className="font-semibold">{courier.name}</div>
                      <div className="text-xs text-gray-500">Domestic</div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {courier.estimated_delivery || "--"}
                  </td>

                  <td className="px-4 py-4">
                    {courier.minimum_chargeable_weight}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    ₹ {courier.total_charges.toFixed(2)}
                  </td>

                  <td className="px-4 py-4">
                 <button
                    onClick={() => shipNow(selectedOrder.tracking_number, courier.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs"
                  >
                    Ship Now 
                  </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalRatePages > 1 && (
  <div className="mt-6 flex justify-center items-center gap-2">

    <button
      onClick={() => setRatePage(Math.max(1, ratePage - 1))}
      disabled={ratePage === 1}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      ← Prev
    </button>

    {Array.from({ length: totalRatePages }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => setRatePage(p)}
        className={`px-3 py-1 rounded ${
          ratePage === p
            ? "bg-blue-600 text-white"
            : "border"
        }`}
      >
        {p}
      </button>
    ))}

    <button
      onClick={() => setRatePage(Math.min(totalRatePages, ratePage + 1))}
      disabled={ratePage === totalRatePages}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next →
    </button>

  </div>
)}

      </div>

    </div>
  </div>
)}
    </div>
  );
}
