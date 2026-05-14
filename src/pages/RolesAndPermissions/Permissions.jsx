import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";
import api from "../../api/axios";

export default function Permissions() {
  useDynamicTitle("Permissions");

  const [permissions, setPermissions] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/role-permissions", {
        params: { search },
      });

      setPermissions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [search]);

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!name) return alert("Enter permission name");

    try {
      await api.post("/admin-dashboard/create-permission", {
        name,
      });

      setName("");
      fetchPermissions();
    } catch (e) {
      alert(e.response?.data?.message || "Error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Delete this permission?")) return;

    await api.delete(`/admin-dashboard/delete-permission/${id}`);
    fetchPermissions();
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Permissions</h1>

        <div className="flex gap-3 flex-wrap items-start">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-60"
          />

          <input
            placeholder="Permission name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          />

          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Permission
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Permission</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : permissions.length ? (
              permissions.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>

                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-6">
                  No permissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}