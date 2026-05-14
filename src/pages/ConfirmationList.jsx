import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
/* MOCK DATA – replace with API */
const DATA = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  date: "2025-12-04 23:57",
  confirmationId: `GILCNF${1100 + i}`,
  client: [
    "Rajdeep Jewellers",
    "Shiv Jewellers",
    "Aabharanam Jewels",
    "Pavan Mor Jewellers",
  ][i % 4],
  depositor: "Ramesh",
  receiver: "Suresh",
}));

export default function ConfirmationList() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  /* FILTER */
  const filteredData = useMemo(() => {
    return DATA.filter(
      (row) =>
        row.confirmationId.toLowerCase().includes(searchId.toLowerCase()) &&
        row.client.toLowerCase().includes(searchClient.toLowerCase())
    );
  }, [searchId, searchClient]);

  /* PAGINATION */
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const rows = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">Confirmation List</h1>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          placeholder="Search Confirmation No"
          value={searchId}
          onChange={(e) => {
            setSearchId(e.target.value);
            setPage(1);
          }}
          className="input"
        />

        <input
          placeholder="Search Client Name"
          value={searchClient}
          onChange={(e) => {
            setSearchClient(e.target.value);
            setPage(1);
          }}
          className="input"
        />

        <div className="md:col-span-2 flex gap-3">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
            Search
          </button>
          <button
            onClick={() => {
              setSearchId("");
              setSearchClient("");
            }}
            className="border px-6 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">S.No</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Confirmation ID</th>
              <th className="px-4 py-3 text-left">Client Name</th>
              <th className="px-4 py-3 text-left">Depositor</th>
              <th className="px-4 py-3 text-left">Receiver</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {(page - 1) * pageSize + index + 1}
                </td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3 font-medium">{row.confirmationId}</td>
                <td className="px-4 py-3">{row.client}</td>
                <td className="px-4 py-3">{row.depositor}</td>
                <td className="px-4 py-3">{row.receiver}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <Link
                    to={`/edit-confirmation/${row.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button className="text-green-600 hover:underline">
                    Print
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <p className="font-semibold">{row.confirmationId}</p>
            <p className="text-sm text-gray-600">{row.client}</p>
            <p className="text-sm text-gray-600">{row.date}</p>

            <div className="flex gap-4 pt-2">
              <Link
                to={`/edit-confirmation/${row.id}`}
                className="text-indigo-600 text-sm"
              >
                Edit
              </Link>

              <button
                onClick={() => {
                  window.location.href = `/confirmation-print/${row.id}`;
                }}
                className="text-green-600 hover:underline cursor-pointer"
              >
                Print
              </button>
            </div>
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
