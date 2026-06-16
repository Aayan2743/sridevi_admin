import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import SettingsLayout from "./settings/SettingsLayout";
import { useAuth } from "../auth/AuthContext";
import AccessDenied from "./components/AccessDenied";

export default function AffiliateManager() {
  const { can } = useAuth();

  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({});

  const [page, setPage] = useState(1);

  const fetchAffiliates = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/admin-dashboard/affiliates?page=${pageNumber}`,
      );

      setAffiliates(res.data.data.data);
      setPagination(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch affiliates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates(page);
  }, [page]);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const approveAffiliate = async (id) => {
    try {
      await api.post(`/admin-dashboard/affiliates/${id}/approve`);

      toast.success("Affiliate approved");
      fetchAffiliates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const rejectAffiliate = async (id) => {
    const remarks = prompt("Enter rejection reason:");

    if (!remarks) return;

    try {
      await api.post(`/admin-dashboard/affiliates/${id}/reject`, { remarks });

      toast.success("Affiliate rejected");
      fetchAffiliates(page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  //   if (!can("affiliate.view")) {
  //     return (
  //       <SettingsLayout>
  //         <AccessDenied />
  //       </SettingsLayout>
  //     );
  //   }

  return (
    <SettingsLayout>
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Affiliate Requests</h2>

          <p className="text-sm text-gray-500">Manage affiliate applications</p>
        </div>

        <div className="overflow-hidden border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">User</th>

                <th className="px-4 py-3 text-left">Code</th>

                <th className="px-4 py-3 text-left">UPI ID</th>

                <th className="px-4 py-3 text-left">Aadhaar</th>

                <th className="px-4 py-3 text-left">PAN</th>

                <th className="px-4 py-3 text-left">Status</th>

                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {affiliates.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.user?.name}</div>

                    <div className="text-xs text-gray-500">
                      {item.user?.email}
                    </div>
                  </td>

                  {/* Code */}
                  <td className="px-4 py-3 font-mono">{item.code}</td>

                  {/* UPI */}
                  <td className="px-4 py-3">{item.upi_id}</td>

                  {/* Aadhaar */}
                  <td className="px-4 py-3">
                    <a
                      href={item.aadhaar_card_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={item.aadhaar_card_url}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    </a>
                  </td>

                  {/* PAN */}
                  <td className="px-4 py-3">
                    <a
                      href={item.pan_card_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={item.pan_card_url}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    </a>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 space-x-2">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveAffiliate(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectAffiliate(item.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {item.status !== "pending" && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {affiliates.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No affiliate requests found
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsLayout>
  );
}
