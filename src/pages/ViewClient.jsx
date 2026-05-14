import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

/* TEMP DATA (replace with API later) */
const CLIENTS = Array.from({ length: 27 }, (_, i) => ({
  id: i + 1,
  name: `Client ${i + 1}`,
  mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
  city: ["Hyderabad", "Mumbai", "Delhi", "Chennai"][i % 4],
  gstin: `GSTIN${i + 1}`,
  status: i % 2 === 0 ? "Active" : "Inactive",
}));

export default function ViewClient() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    city: "",
    gstin: "",
    status: "",
  });

  const [page, setPage] = useState(1);
  const pageSize = 5;

  /* FILTER LOGIC */
  const filteredData = useMemo(() => {
    return CLIENTS.filter((c) => {
      const globalMatch = Object.values(c)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const columnMatch =
        c.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        c.mobile.includes(filters.mobile) &&
        c.city.toLowerCase().includes(filters.city.toLowerCase()) &&
        c.gstin.toLowerCase().includes(filters.gstin.toLowerCase()) &&
        (filters.status === "" || c.status === filters.status);

      return globalMatch && columnMatch;
    });
  }, [search, filters]);

  /* PAGINATION */
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const updateFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">View Clients</h1>

        <input
          placeholder="Global Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-72 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow grid grid-cols-2 md:grid-cols-5 gap-3">
        <input
          name="name"
          placeholder="Client Name"
          onChange={updateFilter}
          className="input"
        />
        <input
          name="mobile"
          placeholder="Mobile"
          onChange={updateFilter}
          className="input"
        />
        <input
          name="city"
          placeholder="City"
          onChange={updateFilter}
          className="input"
        />
        <input
          name="gstin"
          placeholder="GSTIN"
          onChange={updateFilter}
          className="input"
        />
        <select name="status" onChange={updateFilter} className="input">
          <option value="">Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Client", "Mobile", "City", "GSTIN", "Status", "Action"].map(
                (h) => (
                  <th key={h} className="px-6 py-3 text-left text-gray-600">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}

            {paginatedData.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">{c.mobile}</td>
                <td className="px-6 py-4">{c.city}</td>
                <td className="px-6 py-4">{c.gstin}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-indigo-600">View</button>
                  <button
                    onClick={() => navigate(`/edit-client/${c.id}`)}
                    className="text-gray-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold">{c.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  c.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">📞 {c.mobile}</p>
            <p className="text-sm text-gray-600">📍 {c.city}</p>
            <p className="text-sm text-gray-600 break-all">🧾 {c.gstin}</p>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
