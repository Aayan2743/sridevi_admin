import { useState, useEffect } from "react";

export default function Clarity() {
  /* ================= DATA ================= */
  const [clarities, setClarities] = useState([
    { id: 1, name: "None", checked: false },
    { id: 2, name: "-", checked: false },
    { id: 3, name: "I3", checked: false },
    { id: 4, name: "I2", checked: false },
    { id: 5, name: "I1", checked: false },
    { id: 6, name: "SI2", checked: false },
    { id: 7, name: "SI1", checked: false },
    { id: 8, name: "VS2", checked: false },
    { id: 9, name: "VS1", checked: false },
    { id: 10, name: "VVS2", checked: false },
    { id: 11, name: "VVS1", checked: false },
  ]);

  /* ================= FORM ================= */
  const [clarityInput, setClarityInput] = useState("");
  const [editId, setEditId] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(clarities.length / itemsPerPage);

  const paginatedClarities = clarities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* Reset page when page size changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clarityInput.trim()) return;

    if (editId) {
      setClarities((prev) =>
        prev.map((c) =>
          c.id === editId ? { ...c, name: clarityInput } : c
        )
      );
      setEditId(null);
    } else {
      setClarities((prev) => [
        ...prev,
        { id: Date.now(), name: clarityInput, checked: false },
      ]);
    }

    setClarityInput("");
  };

  /* ================= EDIT ================= */
  const handleEdit = (clarity) => {
    setClarityInput(clarity.name);
    setEditId(clarity.id);
  };

  /* ================= CHECKBOX ================= */
  const toggleCheck = (id) => {
    setClarities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, checked: !c.checked } : c
      )
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = () => {
    setClarities((prev) => prev.filter((c) => !c.checked));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h1 className="text-xl font-semibold flex items-center gap-2">
        📁 Clarity
      </h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">
            Clarity :
          </label>
          <input
            value={clarityInput}
            onChange={(e) => setClarityInput(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter clarity"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            {editId ? "Update" : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => {
              setClarityInput("");
              setEditId(null);
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#b08a5a] text-white">
            <tr>
              <th className="p-3 text-left">Clarity Name</th>
              <th className="p-3 text-left">Edit</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClarities.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.name}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-lg"
                  >
                    ✏️
                  </button>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={c.checked}
                    onChange={() => toggleCheck(c.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE */}
      <button
        onClick={handleDelete}
        className="bg-gray-800 text-white px-4 py-2 rounded"
      >
        delete
      </button>

      {/* PAGINATION + PAGE SIZE SELECT */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50 px-4 py-3 rounded border">
        {/* LEFT */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-4 py-2 rounded border text-sm
              ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed bg-white"
                  : "hover:bg-gray-100"
              }`}
          >
            Prev
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-4 py-2 rounded border text-sm
              ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed bg-white"
                  : "hover:bg-gray-100"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
