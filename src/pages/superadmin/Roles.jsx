import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext"; 
export default function Roles() {

    const { can , refreshPermissions,refreshUser   } = useAuth();
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
    const res = await api.get(
      `/super-admin-dashboard/role-permissions/${role}`
    );
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

      await refreshUser();
     await refreshPermissions();

    toast.success("Permissions updated");
  };

  // 🔥 GROUP PERMISSIONS
  const groupedPermissions = (permissions || []).reduce((acc, perm) => {
    if (!perm?.name) return acc;

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
    // <div className="grid md:grid-cols-2 gap-6">
    //   {/* ================= ROLE LIST ================= */}
    //   <div className="bg-white/5 p-5 rounded-xl border border-white/10">
    //     <h3 className="mb-3 font-semibold">Roles</h3>

    //     {/* ADD ROLE */}
    //     <div className="flex gap-2 mb-4">
    //       <input
    //         placeholder="New role"
    //         value={newRole}
    //         onChange={(e) => setNewRole(e.target.value)}
    //         className="px-3 py-2 bg-gray-800 rounded text-white w-full"
    //       />
    //       <button
    //         onClick={handleCreateRole}
    //         className="bg-purple-600 px-3 rounded"
    //       >
    //         Add
    //       </button>
    //     </div>

    //     <ul className="space-y-2">
    //       {roles.map((role) => (
    //         <li
    //           key={role.id}
    //           onClick={() => {
    //             setSelectedRole(role.name);
    //             fetchPermissions(role.name);
    //           }}
    //           className={`p-2 rounded cursor-pointer ${
    //             selectedRole === role.name
    //               ? "bg-purple-600"
    //               : "hover:bg-white/10"
    //           }`}
    //         >
    //           {role.name}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   {/* ================= PERMISSIONS ================= */}
    //   <div className="bg-white/5 p-5 rounded-xl border border-white/10">
    //     <h3 className="mb-3 font-semibold">
    //       Permissions ({selectedRole || "Select Role"})
    //     </h3>

    //     {!selectedRole ? (
    //       <p className="text-gray-400">Select a role first</p>
    //     ) : (
    //       <>
    //         {Object.keys(groupedPermissions).map((module) => (
    //           <div
    //             key={module}
    //             className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4"
    //           >
    //             {/* MODULE TITLE */}
    //             <h3 className="text-lg font-semibold mb-3 capitalize">
    //               📦 {module}
    //             </h3>

    //             {/* PERMISSIONS */}
    //             <div className="grid grid-cols-2 gap-3">
    //               {groupedPermissions[module].map((perm) => (
    //                 <label
    //                   key={perm.id}
    //                   className="flex items-center gap-2 bg-black/30 p-2 rounded cursor-pointer hover:bg-black/50"
    //                 >
    //                   <input
    //                     type="checkbox"
    //                     checked={perm.checked || false}
    //                     onChange={() => togglePermission(perm.name)}
    //                   />

    //                   <span className="capitalize">
    //                     {perm.action.replace(/_/g, " ")}
    //                   </span>
    //                 </label>
    //               ))}
    //             </div>
    //           </div>
    //         ))}

    //         {/* SAVE BUTTON */}
    //         <button
    //           onClick={handleSave}
    //           className="mt-4 bg-purple-600 px-4 py-2 rounded w-full"
    //         >
    //           Save Permissions
    //         </button>
    //       </>
    //     )}
    //   </div>
    // </div>


    <div className="grid md:grid-cols-3 gap-6">

  {/* ================= LEFT: ROLES ================= */}
  <div className="bg-white rounded-2xl shadow p-5 space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">Roles</h2>

    {/* ADD ROLE */}
    <div className="flex gap-2">
      <input
        placeholder="New role"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        // className="flex-1 px-3 py-2 border rounded-lg text-sm"
         className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleCreateRole}
        className="bg-indigo-600 text-white px-4 rounded-lg"
      >
        Add
      </button>
    </div>

    {/* ROLE LIST */}
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {roles.map((role) => (
        <div
          key={role.id}
          onClick={() => {
            setSelectedRole(role.name);
            fetchPermissions(role.name);
          }}
          className={`p-3 rounded-xl cursor-pointer border transition ${
            selectedRole === role.name
              ? "bg-indigo-50 border-indigo-400"
              : "hover:bg-gray-50"
          }`}
        >
          <p className="font-medium text-gray-800 capitalize">
            {role.name}
          </p>
        </div>
      ))}
    </div>
  </div>

  {/* ================= RIGHT: PERMISSIONS ================= */}
  <div className="md:col-span-2 space-y-6">

    {/* HEADER */}
    <div className="flex justify-between items-center sticky top-0 bg-gray-50 p-4 rounded-xl z-10">
      <h2 className="text-xl font-semibold text-gray-800 capitalize">
        {selectedRole || "Select Role"}
      </h2>

      {selectedRole && (
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow"
        >
          Save Changes
        </button>
      )}
    </div>

    {!selectedRole ? (
      <div className="bg-white rounded-xl p-10 text-center text-gray-400">
        Select a role to manage permissions
      </div>
    ) : (
      Object.keys(groupedPermissions).map((module) => (
        <div
          key={module}
          className="bg-white border rounded-2xl shadow-sm p-5 space-y-4"
        >
          {/* MODULE HEADER */}
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-700 capitalize">
              {module} Management
            </h3>

            {/* TOGGLE ALL */}
            <button
              onClick={() => {
                const all = groupedPermissions[module].map(p => p.name);
                const allSelected = all.every(n =>
                  permissions.find(p => p.name === n && p.checked)
                );

                setPermissions(prev =>
                  prev.map(p =>
                    all.includes(p.name)
                      ? { ...p, checked: !allSelected }
                      : p
                  )
                );
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Toggle All
            </button>
          </div>

          {/* PERMISSIONS */}
          <div className="grid md:grid-cols-3 gap-4">
            {groupedPermissions[module].map((perm) => {
              const isChecked = perm.checked;

              return (
                <div
                  key={perm.id}
                  className={`flex justify-between items-center border rounded-xl px-4 py-3 transition ${
                    isChecked
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-gray-50"
                  }`}
                >
                  {/* TEXT */}
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">
                      {perm.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {perm.name}
                    </p>
                  </div>

                  {/* TOGGLE */}
                  <button
                    onClick={() => togglePermission(perm.name)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      isChecked ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                        isChecked ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))
    )}
  </div>
</div>
  );
}