import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../components/AccessDenied";
import { showErrorToast, showSuccessToast } from "../../utils/swal";

//assign_roles.view
export default function AssignRole() {

    const { can } = useAuth();


  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/users", {
        params: { search },
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ROLES ================= */
  const fetchRoles = async () => {
    const res = await api.get("/admin-dashboard/roles");
    setRoles(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search]);

  /* ================= ASSIGN ROLE ================= */
  const handleAssign = async (userId, role) => {
    if (!role) return;
    try {
      await api.post("/admin-dashboard/assign-role", {
        user_id: userId,
        role: role,
      });

      showSuccessToast("Role assigned");
      fetchUsers(); // refresh
    } catch (e) {
      console.error(e);
      showErrorToast("Failed to assign role");
    }
  };

  const handleRemove = async (userId, role) => {
  try {
    await api.post("/admin-dashboard/remove-role", {
      user_id: userId,
      role: role,
    });

    showSuccessToast("Role removed");
    fetchUsers(); // refresh
  } catch (e) {
    console.error(e);
    showErrorToast("Failed to remove role");
  }
};


   if (!can("assign_roles.view")) {
    return (
      <AccessDenied />
    );
  }




  const showAssignColumn = can("assign_roles.assign");
  const colSpan = showAssignColumn ? 4 : 3;

   return (
  <div className="min-h-screen space-y-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Assign Roles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage user access by assigning and removing roles quickly.
          </p>
        </div>

        <input
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 md:w-80"
        />
      </div>
    </div>

    {/* TABLE CARD */}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="p-4 text-left">User</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Roles</th>
              
    {showAssignColumn && (

            <th className="p-4 text-left">Assign</th>
    )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="py-10 text-center text-slate-500">
                Loading...
              </td>
            </tr>
          ) : users.length ? (
            users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-slate-100 transition hover:bg-slate-50/70"
              >
                {/* USER */}
                <td className="p-4 font-medium text-slate-900">
                  {u.name}
                </td>

                {/* EMAIL */}
                <td className="p-4 text-slate-600">
                  {u.email}
                </td>

                {/* ROLES */}
                <td className="p-4">
                  {u.roles?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {u.roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"
                        >
                          {role.name}

                          {/* REMOVE BUTTON */}
                          <button
                            onClick={() => handleRemove(u.id, role.name)}
                            className="rounded-full bg-rose-100 px-2 text-xs text-rose-600 transition hover:bg-rose-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      No Role
                    </span>
                  )}
                </td>

                {/* ASSIGN */}

                    {showAssignColumn && (
                <td className="p-4">
                  <select
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    defaultValue=""
                    onChange={(e) =>
                      handleAssign(u.id, e.target.value)
                    }
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                    )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={colSpan} className="py-10 text-center text-slate-400">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  </div>
);
  
}