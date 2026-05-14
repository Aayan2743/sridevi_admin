import { useState } from "react";

export default function StaffAddComponent() {
  /* ================= STATE ================= */
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: "Arun",
      email: "arun@shop.com",
      phone: "9000011111",
      role: "Manager",
    },
    {
      id: 2,
      name: "Sneha",
      email: "sneha@shop.com",
      phone: "9000022222",
      role: "Sales Executive",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addStaff = () => {
    if (!form.name || !form.email || !form.phone || !form.role) {
      alert("All fields required");
      return;
    }

    setStaffList([...staffList, { id: Date.now(), ...form }]);

    setForm({ name: "", email: "", phone: "", role: "" });
    setShowForm(false);
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Staff</h1>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          + Add Staff
        </button>
      </div>

      {/* ADD STAFF FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="font-semibold">Add New Staff</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addStaff}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* STAFF TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>

          <tbody>
            {staffList.map((s, i) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">{s.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
