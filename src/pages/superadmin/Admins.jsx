import { useState, useEffect } from "react";
import { X } from "lucide-react";

import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Admins() {
  const [open, setOpen] = useState(false);

  const [creating, setCreating] = useState(false);

  const [editMode, setEditMode] = useState(false);
const [selectedId, setSelectedId] = useState(null);

const [accessOpen, setAccessOpen] = useState(false);
const [selectedAdmin, setSelectedAdmin] = useState(null);
const [roles, setRoles] = useState([]);
const [selectedRoles, setSelectedRoles] = useState([]);

  const [search, setSearch] = useState("");
    const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    });

  // 🔥 form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // 🔥 dummy data (later replace with API)
const [admins, setAdmins] = useState([]);
const [loading, setLoading] = useState(false);


const fetchAdmins = async (page = 1, searchText = "") => {
  try {
    setLoading(true);

    const res = await api.get("/super-admin-dashboard/admin-list", {
      params: {
        page,
        per_page: 5,
        search: searchText,
      },
    });

    if (res.data.success) {
      setAdmins(res.data.data);
      setMeta(res.data.meta);
    }

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

const openAccessDrawer = async (admin) => {
  setSelectedAdmin(admin);
  setAccessOpen(true);

  // fetch all roles
  const res = await api.get("/super-admin-dashboard/roles");
  setRoles(res.data.data);

  // set current roles
  setSelectedRoles(admin.roles || []);
};

const toggleRole = (role) => {
  if (selectedRoles.includes(role)) {
    setSelectedRoles(selectedRoles.filter((r) => r !== role));
  } else {
    setSelectedRoles([...selectedRoles, role]);
  }
};


const handleAssignRole = async () => {
  await api.post("/super-admin-dashboard/assign-role-to-user", {
    user_id: selectedAdmin.id,
    role: selectedRoles,
  });

  toast.success("Access updated ✅");
  setAccessOpen(false);
  fetchAdmins(meta.current_page, search);
};

useEffect(() => {
  fetchAdmins(1, search);
}, []);

  // 🔥 pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;



  const closeDrawer = () => {
  setOpen(false);
  setEditMode(false);
  setForm({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
};


  // 🔥 handle create admin (UI only)
 const handleCreate = async () => {
  if (!form.name || !form.email || !form.phone || !form.password) {
    toast.error("All fields are required");
    return;
  }

  try {
    const res = await api.post("/super-admin-dashboard/admin-register", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (res.data.success) {
      toast.success("Admin created successfully ✅");

      // 🔥 optional: add to UI instantly
      const newAdmin = {
        id: Date.now(),
        ...form,
        status: "Active",
      };

      setAdmins((prev) => [newAdmin, ...prev]);

      // reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });

      setOpen(false);
    } else {
      toast.error(res.data.message);
    }

  } 
  
catch (err) {
  console.log(err);

  const res = err.response?.data;

  if (res?.message) {
    toast.error(res.message);
  } else if (res?.errors) {
    // 🔥 handle string OR object
    if (typeof res.errors === "string") {
      toast.error(res.errors);
    } else {
      // Laravel default errors object
      const firstError = Object.values(res.errors)[0][0];
      toast.error(firstError);
    }
  } else {
    toast.error("Failed to create admin");
  }
}
};

const handleUpdate = async () => {
  try {
    const res = await api.post(`/super-admin-dashboard/admin-update/${selectedId}`, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (res.data.success) {
      toast.success("Admin updated ✅");
      setOpen(false);
      setEditMode(false);
      fetchAdmins(meta.current_page, search);
    }
  } catch (err) {
    toast.error("Update failed");
  }
};


const toggleStatus = async (admin) => {
  try {
    const res = await api.post(
      `/super-admin-dashboard/admin-status/${admin.id}`,
      {
        status: admin.status === "active" ? "inactive" : "active",
      }
    );

    if (res.data.success) {
      toast.success("Status updated");
      fetchAdmins(meta.current_page, search);
    }
  } catch (err) {
    toast.error("Failed to update status");
  }
};

const handleDelete = async (id) => {
  if (!confirm("Are you sure to delete?")) return;

  try {
    const res = await api.delete(
      `/super-admin-dashboard/admin-delete/${id}`
    );

    if (res.data.success) {
      toast.success("Deleted successfully");
      fetchAdmins(meta.current_page, search);
    }
  } catch (err) {
    toast.error("Delete failed");
  }
};

  return (
    <div>
      {/* HEADER */}
      

      <div className="flex justify-between mb-4">
  <input
    type="text"
    placeholder="Search admin..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      fetchAdmins(1, e.target.value); // 🔥 live search
    }}
    className="px-4 py-2 bg-gray-800 text-white rounded-lg w-64"
  />

  <button
    onClick={() => setOpen(true)}
    className="bg-purple-600 px-4 py-2 rounded-lg"
  >
    + Add Admin
  </button>
</div>

      {/* TABLE */}
      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
        <table className="w-full">
          <thead className="bg-white/10 text-gray-300">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

       <tbody>
  {admins.map((admin) => (
    <tr key={admin.id} className="border-t border-white/10">
      <td className="p-3">{admin.name}</td>
      <td>{admin.email}</td>
      <td>{admin.phone}</td>
  <td>{admin.roles?.join(", ")}</td>
      <td>
        <button
            onClick={() => toggleStatus(admin)}
           className={`px-3 py-1 rounded ${
                admin.status?.toLowerCase() === "active"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
        >
            {admin.status}
        </button>
        </td>
      <td>
      
        <button
        onClick={() => {
            setForm({
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            password: "",
            });
            setSelectedId(admin.id);
            setEditMode(true);
            setOpen(true);
        }}
        className="text-blue-400 mr-2"
        >
        Edit
        </button>


       <button
        onClick={() => handleDelete(admin.id)}
        className="text-red-400"
      >
        Delete
      </button>


        <button
        onClick={() => openAccessDrawer(admin)}
        className="text-yellow-400 mr-2"
      >
        Access
      </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {/* 🔥 PAGINATION */}
     <div className="flex justify-between items-center mt-4">
  <p className="text-sm text-gray-400">
    Page {meta.current_page} of {meta.last_page}
  </p>

  <div className="flex gap-2">
    <button
      disabled={meta.current_page === 1}
      onClick={() =>
        fetchAdmins(meta.current_page - 1, search)
      }
      className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(meta.last_page)].map((_, i) => (
      <button
        key={i}
        onClick={() => fetchAdmins(i + 1, search)}
        className={`px-3 py-1 rounded ${
          meta.current_page === i + 1
            ? "bg-purple-600"
            : "bg-gray-800"
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={meta.current_page === meta.last_page}
      onClick={() =>
        fetchAdmins(meta.current_page + 1, search)
      }
      className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>
      {/* ================= DRAWER ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-gray-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Add Admin</h3>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full p-2 bg-gray-800 rounded text-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full p-2 bg-gray-800 rounded text-white"
          />

          <input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full p-2 bg-gray-800 rounded text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full p-2 bg-gray-800 rounded text-white"
          />

       <button
        onClick={editMode ? handleUpdate : handleCreate}
        className="w-full bg-purple-600 py-2 rounded-lg"
        >
        {editMode ? "Update Admin" : "Create Admin"}
        </button>
        </div>
      </div>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        ></div>
      )}


      {accessOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/50 z-40"
      onClick={() => setAccessOpen(false)}
    />

    <div className="fixed right-0 top-0 h-full w-[400px] bg-gray-900 z-50 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-white">
        Assign Access
      </h2>

      <p className="text-sm text-gray-400">
        {selectedAdmin?.name}
      </p>

      {/* ROLES */}
      <div className="space-y-2">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => toggleRole(role.name)}
            className={`p-3 rounded-lg cursor-pointer border ${
              selectedRoles.includes(role.name)
                ? "bg-purple-600"
                : "bg-gray-800"
            }`}
          >
            {role.name}
          </div>
        ))}
      </div>

      <button
        onClick={handleAssignRole}
        className="w-full bg-purple-600 py-2 rounded-lg"
      >
        Save Access
      </button>
    </div>
  </>
)}
    </div>
  );
}