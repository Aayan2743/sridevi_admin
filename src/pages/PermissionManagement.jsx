import { useState } from "react";
import { Settings, Users } from "lucide-react";

export default function PermissionManagement() {
  const [selectedUser, setSelectedUser] = useState(1);

  const users = [
    { id: 1, name: "Admin", role: "admin" },
    { id: 2, name: "Rahul", role: "manager" },
    { id: 3, name: "Asif", role: "staff" },
  ];

  const permissionModules = [
    {
      title: "Dashboard",
      permissions: ["dashboard.view"],
    },
    {
      title: "Products",
      permissions: ["products.view", "products.create", "products.edit"],
    },
    {
      title: "Orders",
      permissions: ["orders.view", "orders.update", "orders.cancel"],
    },
    {
      title: "Payments",
      permissions: ["payments.view", "payments.refund"],
    },
    {
      title: "Expenses",
      permissions: ["expenses.view", "expenses.create"],
    },
    {
      title: "Reports",
      permissions: ["reports.view"],
    },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState({
    2: ["dashboard.view", "products.view"],
    3: ["dashboard.view"],
  });

  const togglePermission = (permission) => {
    if (users.find((u) => u.id === selectedUser)?.role === "admin") return;

    const current = selectedPermissions[selectedUser] || [];

    const updated = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];

    setSelectedPermissions({
      ...selectedPermissions,
      [selectedUser]: updated,
    });
  };

  const handleSave = () => {
    alert("Permissions saved (mock)");
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Settings className="text-orange-500" />
        <h1 className="text-2xl font-semibold">Permission Management</h1>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* USER LIST */}
        <div className="bg-white shadow rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-gray-600 mb-3">Users</h3>

          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedUser === user.id
                  ? "bg-yellow-100 border border-orange-400"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          ))}
        </div>

        {/* PERMISSION PANEL */}
        <div className="col-span-3 bg-white shadow rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold mb-4">Assign Permissions</h3>

          {permissionModules.map((module, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-700">{module.title}</h4>

              <div className="grid grid-cols-2 gap-4">
                {module.permissions.map((permission) => {
                  const isChecked =
                    users.find((u) => u.id === selectedUser)?.role ===
                      "admin" ||
                    (selectedPermissions[selectedUser] || []).includes(
                      permission,
                    );

                  return (
                    <label
                      key={permission}
                      className="flex items-center justify-between border px-3 py-2 rounded-lg text-sm"
                    >
                      {permission}

                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={
                          users.find((u) => u.id === selectedUser)?.role ===
                          "admin"
                        }
                        onChange={() => togglePermission(permission)}
                        className="accent-orange-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
