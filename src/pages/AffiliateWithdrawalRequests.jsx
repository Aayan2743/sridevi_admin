import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Eye,
  Wallet,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import SettingsLayout from "./settings/SettingsLayout";

import { toast } from "react-hot-toast";
import api from "../api/axios";

import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function AffiliateWithdrawalRequests() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const [requests, setRequests] = useState([]);

  const [paymentProof, setPaymentProof] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [summary, setSummary] = useState({
    pending: 0,
    paid: 0,
    rejected: 0,
    total_requested: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/affiliate-withdrawals");

      setRequests(res.data.data);
      setSummary(res.data.summary);
    } catch (error) {
      toast.error("Failed to fetch withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((item) =>
      item.affiliate.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [requests, search]);

  const statusBadge = (status) => {
    status = status?.toLowerCase();
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Pending
          </span>
        );

      case "paid":
        return (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Paid
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Rejected
          </span>
        );

      default:
        return null;
    }
  };

  const approveWithdrawal = async (id) => {
    try {
      if (!paymentProof) {
        toast.error("Please upload payment proof.");
        return;
      }

      const formData = new FormData();

      formData.append("payment_proof", paymentProof);
      formData.append("remarks", remarks);

      await api.post(
        `/admin-dashboard/affiliate-withdrawals/${id}/approve`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Withdrawal approved successfully");

      fetchWithdrawalRequests();

      setSelected(null);
      setPaymentProof(null);
      setRemarks("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed.");
    }
  };

  return (
    <SettingsLayout>
      <div className="p-6 space-y-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Affiliate Withdrawal Requests
            </h1>

            <p className="text-gray-500 mt-1">
              Manage affiliate withdrawal requests
            </p>
          </div>
        </div>

        {/* Summary */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>

                <h2 className="text-3xl font-bold mt-2">{summary.pending}</h2>
              </div>

              <Clock3 className="text-yellow-500" />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Paid</p>

                <h2 className="text-3xl font-bold mt-2">{summary.paid}</h2>
              </div>

              <CheckCircle2 className="text-green-600" />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>

                <h2 className="text-3xl font-bold mt-2">{summary.rejected}</h2>
              </div>

              <XCircle className="text-red-500" />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Requested</p>

                <h2 className="text-3xl font-bold mt-2">
                  ₹{Number(summary.total_requested).toLocaleString("en-IN")}
                </h2>
              </div>

              <Wallet className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search affiliate..."
            className="w-full rounded-lg border pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}

        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left">Affiliate</th>

                <th className="px-5 py-4 text-right">Requested</th>

                <th className="px-5 py-4 text-right">Total Earned</th>

                <th className="px-5 py-4 text-right">Available</th>

                <th className="px-5 py-4 text-center">Status</th>

                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium">
                    <div>{item.affiliate.name}</div>

                    <div className="text-xs text-gray-500">
                      {item.requested_at}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right font-semibold">
                    ₹{Number(item.requested_amount).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-right">
                    ₹{Number(item.total_earned).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-right text-green-600 font-semibold">
                    ₹{Number(item.available_balance).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4 text-center">
                    {/* Status badge comes in Part 2 */}
                    {statusBadge(
                      item.status.charAt(0).toUpperCase() +
                        item.status.slice(1),
                    )}
                  </td>

                  <td className="px-5 py-4 text-center">
                    {/* View button comes in Part 2 */}

                    <button
                      onClick={() => setSelected(item)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
            <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-2xl font-bold">Withdrawal Details</h2>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border px-3 py-1 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="rounded-xl border p-5">
                  <h3 className="mb-4 font-semibold text-lg">Affiliate</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Name</span>
                      <span className="font-medium">
                        {selected.affiliate.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Requested</span>
                      <span className="font-semibold text-red-600">
                        ₹{selected.requested_amount}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Total Earned</span>
                      <span className="font-semibold text-green-600">
                        ₹{selected.total_earned}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Available Balance</span>
                      <span className="font-semibold text-blue-600">
                        ₹{selected.available_balance}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Status</span>
                      {statusBadge(selected.status)}
                    </div>

                    <div className="flex justify-between">
                      <span>Requested On</span>
                      <span>{selected.requested_at}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-5">
                  <h3 className="mb-4 font-semibold">Summary</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Requested Amount dd
                      </p>

                      <p className="mt-2 text-xl font-bold">
                        ₹
                        {Number(selected?.requested_amount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Available Balance</p>

                      <p className="mt-2 text-xl font-bold">
                        ₹
                        {Number(
                          selected?.available_balance || 0,
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Proof <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPaymentProof(e.target.files[0])}
                      className="w-full rounded-lg border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Remarks
                    </label>

                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks..."
                      className="w-full rounded-lg border p-3"
                    />
                  </div>
                </div>

                {selected.status?.toLowerCase() === "pending" && (
                  <div className="flex gap-3">
                    {/* <button className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700">
                      Approve
                    </button> */}

                    <button
                      onClick={() => approveWithdrawal(selected.id)}
                      className="flex-1 rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
