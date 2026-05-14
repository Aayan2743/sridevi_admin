import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  const [newRole, setNewRole] = useState("");

  // 🔥 Fetch Roles
  const fetchRoles = async () => {
    const res = await api.get("/super-admin-dashboard/roles");
    setRoles(res.data.data);
  };

  // 🔥 Fetch Permissions for Selected Role
  const fetchPermissions = async (role) => {
    const res = await api.get(`/super-admin-dashboard/role-permissions/${role}`);
    setPermissions(res.data.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 🔥 Create Role
  const handleCreateRole = async () => {
    if (!newRole) return;

    const res = await api.post("/super-admin-dashboard/create-role", {
      name: newRole,
    });

    if (res.data.success) {
      toast.success("Role created");
      setNewRole("");
      fetchRoles();
    }
  };

  // 🔥 Toggle Permission
  const togglePermission = (name) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.name === name ? { ...p, checked: !p.checked } : p
      )
    );
  };

  // 🔥 Save Permissions
  const handleSave = async () => {
    const selected = permissions
      .filter((p) => p.checked)
      .map((p) => p.name);

    await api.post("/super-admin-dashboard/assign-permissions", {
      role: selectedRole,
      permissions: selected,
    });

    toast.success("Permissions updated");
  };



  const groupedPermissions = permissions.reduce((acc, perm) => {
  if (!perm.name) return acc;

  const parts = perm.name.split(".");

  if (parts.length < 2) return acc;

  const module = parts[0];
  const action = parts[1];

  if (!acc[module]) acc[module] = [];

  acc[module].push({
    ...perm,
    action,
  });

  return acc;
}, {});




  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* ================= ROLE LIST ================= */}
      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
        <h3 className="mb-3 font-semibold">Roles</h3>

        {/* ADD ROLE */}
        <div className="flex gap-2 mb-4">
          <input
            placeholder="New role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="px-3 py-2 bg-gray-800 rounded text-white w-full"
          />
          <button
            onClick={handleCreateRole}
            className="bg-purple-600 px-3 rounded"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {roles.map((role) => (
            <li
              key={role.id}
              onClick={() => {
                setSelectedRole(role.name);
                fetchPermissions(role.name);
              }}
              className={`p-2 rounded cursor-pointer ${
                selectedRole === role.name
                  ? "bg-purple-600"
                  : "hover:bg-white/10"
              }`}
            >
              {role.name}
            </li>
          ))}
        </ul>
      </div>

      {/* ================= PERMISSIONS ================= */}
      <div className="bg-white/5 p-5 rounded-xl border border-white/10">
        <h3 className="mb-3 font-semibold">
          Permissions ({selectedRole || "Select Role"})
        </h3>

        {!selectedRole ? (
          <p className="text-gray-400">Select a role first</p>
        ) : (
          <>
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
  <h3 className="mb-3 font-semibold">
    Permissions ({selectedRole || "Select Role"})
  </h3>

  {!selectedRole ? (
    <p className="text-gray-400">Select a role first</p>
  ) : (
    Object.keys(groupedPermissions).map((module) => (
      <div
        key={module}
        className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4"
      >
        {/* MODULE TITLE */}
        <h3 className="text-lg font-semibold mb-3 capitalize">
          📦 {module}
        </h3>

        {/* PERMISSIONS */}
        <div className="grid grid-cols-2 gap-3">
          {groupedPermissions[module].map((perm) => (
            <label
              key={perm.id}
              className="flex items-center gap-2 bg-black/30 p-2 rounded cursor-pointer hover:bg-black/50"
            >
              <input
                type="checkbox"
                checked={perm.checked || false}
                onChange={() => togglePermission(perm.name)}
              />

              <span className="capitalize">
                {perm.action.replace(/_/g, " ")}
              </span>
            </label>
          ))}
        </div>
      </div>
    ))
  )}
        </div>

            <button
              onClick={handleSave}
              className="mt-4 bg-purple-600 px-4 py-2 rounded"
            >
              Save Permissions
            </button>
          </>
        )}
      </div>
    </div>
  );
}