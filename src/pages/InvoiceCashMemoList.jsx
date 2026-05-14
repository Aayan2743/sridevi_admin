import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

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
  receiver: "Admin",
}));

export default function InvoiceCashMemoList() {
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
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">Invoice & Cash Memo</h1>

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

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">S.No</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Confirmation ID</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Receiver</th>
              <th className="px-4 py-3 text-center">Invoice</th>
              <th className="px-4 py-3 text-center">Invoice + Logo</th>
              <th className="px-4 py-3 text-center">Extra</th>
              <th className="px-4 py-3 text-center">Cash Memo</th>
              <th className="px-4 py-3 text-center">Download</th>
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
                <td className="px-4 py-3">{row.receiver}</td>

                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/invoice/${row.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Get Invoice
                  </Link>
                </td>

                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/invoice-logo/${row.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    With Logo
                  </Link>
                </td>

                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/extra-charge/${row.id}`}
                    className="text-orange-600 hover:underline"
                  >
                    Extra Charge
                  </Link>
                </td>

                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/cash-memo/${row.id}`}
                    className="text-green-600 hover:underline"
                  >
                    Cash Memo
                  </Link>
                </td>

                <td className="px-4 py-3 text-center">
                  <button className="text-gray-600 hover:underline">
                    Download
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white p-4 rounded-xl shadow space-y-2"
          >
            <p className="font-semibold">{row.confirmationId}</p>
            <p className="text-sm text-gray-600">{row.client}</p>
            <p className="text-sm text-gray-500">{row.date}</p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <Link to={`/invoice/${row.id}`} className="text-indigo-600">
                Invoice
              </Link>

              <Link to={`/invoice-logo/${row.id}`} className="text-indigo-600">
                Invoice + Logo
              </Link>

              <Link to={`/extra-charge/${row.id}`} className="text-orange-600">
                Extra Charge
              </Link>

              <Link to={`/cash-memo/${row.id}`} className="text-green-600">
                Cash Memo
              </Link>
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
