import { useState, useEffect } from "react";
import useDynamicTitle from "../../hooks/useDynamicTitle";

import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext"; 

export default function RolePermission() {
  const { role } = useParams();
  useDynamicTitle("Permissions");
  const { can , refreshPermissions  } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const res1 = await api.get("/admin-dashboard/role-permissions");
      const res2 = await api.get(`/admin-dashboard/role-permissions/${role}`);

      setPermissions(res1.data);
      setSelected(res2.data.permissions.map((p) => p.name));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);


  /* ================= TOGGLE ================= */
  const toggle = (name) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((p) => p !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    await api.post("/admin-dashboard/assign-permission", {
      role,
      permissions: selected,
    });

      await refreshPermissions();

    alert("Saved successfully");
  };

  return (
   
    <div className="space-y-6">
  {/* HEADER */}
  <div className="flex justify-between items-center sticky top-0 bg-gray-50 p-4 rounded-xl z-10">
    <h1 className="text-2xl font-semibold text-gray-800 capitalize">
      {role} Permissions
    </h1>

    <button
      onClick={handleSave}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow"
    >
      Save Changes
    </button>
  </div>

  {/* CONTENT */}
  <div className="space-y-6">
    {loading ? (
      <p className="text-center py-10 text-gray-500">Loading...</p>
    ) : (
      Object.entries(
        permissions.reduce((acc, p) => {
          const group = p.name.split(".")[0]; // product.add → product
          if (!acc[group]) acc[group] = [];
          acc[group].push(p);
          return acc;
        }, {})
      ).map(([group, items]) => (
        <div
          key={group}
          className="bg-white border rounded-2xl shadow-sm p-5 space-y-4"
        >
          {/* GROUP HEADER */}
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-700 capitalize">
              {group} Management
            </h2>

            {/* SELECT ALL */}
            <button
              // onClick={() => {
              //   const allNames = items.map((i) => i.name);
              //   const allSelected = allNames.every((n) =>
              //     selected.includes(n)
              //   );

              //   if (allSelected) {
              //     setSelected(
              //       selected.filter((s) => !allNames.includes(s))
              //     );
              //   } else {
              //     setSelected([...new Set([...selected, ...allNames])]);
              //   }
              // }}

              onClick={() => {
  const allowedNames = items
    .filter((i) => can(i.name)) // 🔥 only allowed
    .map((i) => i.name);

  const allSelected = allowedNames.every((n) =>
    selected.includes(n)
  );

  if (allSelected) {
    setSelected(selected.filter((s) => !allowedNames.includes(s)));
  } else {
    setSelected([...new Set([...selected, ...allowedNames])]);
  }
}}
              className="text-sm text-indigo-600 hover:underline"
            >
              Toggle All
            </button>
          </div>

          {/* PERMISSIONS */}
          <div className="grid md:grid-cols-3 gap-4">
            {items.map((p) => {
              const isChecked = selected.includes(p.name);
              
            const isAllowed = can(p.name);

              return (
                <div
                  key={p.id}
                  className={`flex justify-between items-center border rounded-xl px-4 py-3 transition ${
                    isChecked
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-gray-50"
                  }`}
                >
                  {/* TEXT */}
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize flex items-center gap-2">
                      {p.name.split(".")[1] || p.name}

                      {!isAllowed && (
                        <span className="text-xs text-red-400">
                          🔒 No Access
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-gray-400">
                      {p.name}
                    </p>
                  </div>

                  {/* TOGGLE SWITCH */}
                  {/* <button
                    onClick={() => toggle(p.name)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                      isChecked ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  > */}
                  <button
                      disabled={!isAllowed}
                      onClick={() => isAllowed && toggle(p.name)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                        isChecked ? "bg-indigo-600" : "bg-gray-300"
                      } ${!isAllowed ? "opacity-40 cursor-not-allowed" : ""}`}
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