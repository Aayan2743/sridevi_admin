import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    label: "",
  });

  const [newPermission, setNewPermission] = useState("");

  // 🔥 FETCH MODULES
  const fetchModules = async () => {
    const res = await api.get("/super-admin-dashboard/modules");
    setModules(res.data.data);
  };

  // 🔥 FETCH MODULE + PERMISSIONS
  const fetchPermissions = async (moduleName) => {
    const res = await api.get("/super-admin-dashboard/modules-permissions");

    const data = res.data.data[moduleName];
    setPermissions(data?.permissions || []);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // 🔥 CREATE MODULE
  const handleCreateModule = async () => {
    try {
      const res = await api.post("/super-admin-dashboard/modules", form);

      if (res.data.success) {
        toast.success("Module created");
        setForm({ name: "", label: "" });
        fetchModules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  // 🔥 TOGGLE MODULE
  const toggleModule = async (id) => {
    await api.post(`/super-admin-dashboard/modules-toggle/${id}`);
    fetchModules();
  };

  // 🔥 ADD PERMISSION
  const handleAddPermission = async () => {
    if (!newPermission) return;

    await api.post("/super-admin-dashboard/add-permission", {
      module: selectedModule,
      action: newPermission,
    });

    toast.success("Permission added");
    setNewPermission("");
    fetchPermissions(selectedModule);
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Module name (products)"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="px-3 py-2 bg-gray-800 rounded text-white"
        />

        <input
          placeholder="Label (Products)"
          value={form.label}
          onChange={(e) =>
            setForm({ ...form, label: e.target.value })
          }
          className="px-3 py-2 bg-gray-800 rounded text-white"
        />

        <button
          onClick={handleCreateModule}
          className="bg-purple-600 px-4 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Module
        </button>
      </div>

      {/* ================= MODULE CARDS ================= */}
      <div className="grid md:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white/5 p-5 rounded-xl border border-white/10"
          >
            <h3 className="mb-2 text-lg font-semibold">
              {mod.label}
            </h3>

            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleModule(mod.id)}
                className={`px-3 py-1 rounded ${
                  mod.is_active
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {mod.is_active ? "Enabled" : "Disabled"}
              </button>

              <button
                onClick={() => {
                  setSelectedModule(mod.name);
                  setOpen(true);
                  fetchPermissions(mod.name);
                }}
                className="text-blue-400 text-sm"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DRAWER ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-gray-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">
            {selectedModule} Permissions
          </h3>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {/* ADD PERMISSION */}
        <div className="p-4 flex gap-2">
          <input
            placeholder="add / edit / delete"
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 rounded text-white"
          />
          <button
            onClick={handleAddPermission}
            className="bg-purple-600 px-3 rounded"
          >
            Add
          </button>
        </div>

        {/* PERMISSION LIST */}
        <div className="p-4 space-y-3">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="bg-white/5 p-2 rounded flex justify-between"
            >
              <span>
                {perm.name.split(".")[1].replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        ></div>
      )}
    </div>
  );
}