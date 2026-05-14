import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext"; 
import AccessDenied from "../components/AccessDenied";
import {
  confirmAction,
  showErrorToast,
  showSuccessToast,
} from "../../utils/swal";

export default function Roles() {


  useDynamicTitle("Roles");

    const { can } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  /* ================= FETCH ================= */
  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/roles", {
        params: { search },
      });

      // ✅ your API returns direct array
      setRoles(res.data || []);
    } catch (e) {
      console.error(e);
      showErrorToast("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [search]);

  /* ================= ADD ================= */
const handleAdd = async () => {
  const roleName = name.trim();
  if (!roleName) return showErrorToast("Enter role name");

  try {
    await api.post("/admin-dashboard/create-role", { name: roleName });

    showSuccessToast("Role created");

    // ✅ INSTANT UI UPDATE (no waiting)
    setRoles((prev) => [
      {
        id: Date.now(), // temporary id
        name: roleName,
      },
      ...prev,
    ]);

    setName("");
    setOpenAddModal(false);

    // 🔥 BACKGROUND SYNC (optional)
    setTimeout(() => {
      fetchRoles();
    }, 300);

  } catch (e) {
    console.error("ERROR:", e);
    showErrorToast("Failed to create role");
  }
};
  /* ================= DELETE ================= */
const handleDelete = async (id) => {
  const confirmed = await confirmAction("Delete this role?");
  if (!confirmed) return;

  try {
    const res = await api.delete(
      `/admin-dashboard/delete-role/${id}`
    );

    if (res.data.status) {
      showSuccessToast("Role deleted");

      // ✅ update from backend response
      
        setTimeout(() => {
      fetchRoles();
    }, 300);

    }
  } catch (e) {
    showErrorToast("Delete failed");
  }
};


   if (!can("roles.view")) {
    return (
      <AccessDenied />
    );
  }


  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Roles</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create roles and control permission management with a cleaner access setup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            {can("roles.add") && (
              <button
                onClick={() => setOpenAddModal(true)}
                className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Add Role
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= ROLE CARDS ================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
            Loading...
          </p>
        ) : roles.length ? (
          roles
            .filter((role) => role.name !== "superadmin") // hide superadmin
            .map((role) => (
              <div
                key={role.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* ROLE NAME */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800 capitalize">
                    {role.name}
                  </h3>

                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    Role
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Configure access and feature permissions for this role.
                </p>

                {/* ACTIONS */}
                <div className="flex justify-between items-center mt-4">

                    {
    can("roles.manage") && (
                  <button
                    onClick={() =>
                      (window.location.href = `/role-permission/${role.name}`)
                    }
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Manage Permissions
                  </button>
    )}  


                  {role.name !== "admin" && role.name !== "superadmin" && (
                        can("roles.delete") && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                          Delete
                        </button>
                        )
                  )}

                  {/* <button
                    onClick={() => handleDelete(role.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button> */}
                </div>
              </div>
            ))
        ) : (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
            No roles found
          </p>
        )}
      </div>

      {openAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Add New Role</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Create a new role, then assign permissions from the role card.
                </p>
              </div>
              <button
                onClick={() => setOpenAddModal(false)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <input
              placeholder="Role name (e.g. manager)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpenAddModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}