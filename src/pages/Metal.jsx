import { useEffect, useState } from "react";

export default function Metal() {
  /* ================= DATA ================= */
  const [metals, setMetals] = useState([
    { id: 1, name: "Rose Gold", code: "RG", checked: false },
    { id: 2, name: "One Platinum", code: "P", checked: false },
    { id: 3, name: "One White Silver", code: "S", checked: false },
    {
      id: 4,
      name: "One Yellow Gold, Partly Rhodium Plated",
      code: "W - Y",
      checked: false,
    },
    { id: 5, name: "One Rhodium Plated Gold", code: "W", checked: false },
  ]);

  /* ================= FORM ================= */
  const [metalName, setMetalName] = useState("");
  const [metalCode, setMetalCode] = useState("");
  const [editId, setEditId] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(metals.length / itemsPerPage);

  const paginatedMetals = metals.slice(
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
    if (!metalName.trim() || !metalCode.trim()) return;

    if (editId) {
      setMetals((prev) =>
        prev.map((m) =>
          m.id === editId
            ? { ...m, name: metalName, code: metalCode }
            : m
        )
      );
      setEditId(null);
    } else {
      setMetals((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: metalName,
          code: metalCode,
          checked: false,
        },
      ]);
    }

    setMetalName("");
    setMetalCode("");
  };

  /* ================= EDIT ================= */
  const handleEdit = (metal) => {
    setMetalName(metal.name);
    setMetalCode(metal.code);
    setEditId(metal.id);
  };

  /* ================= CHECKBOX ================= */
  const toggleCheck = (id) => {
    setMetals((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, checked: !m.checked } : m
      )
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = () => {
    setMetals((prev) => prev.filter((m) => !m.checked));
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-xl font-semibold flex items-center gap-2">
        📁 Metal
      </h1>

      {/* ================= SINGLE LINE FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded"
      >
        {/* METAL NAME */}
        <div className="md:col-span-5">
          <label className="block text-sm font-medium mb-1">
            Metal Name :
          </label>
          <input
            value={metalName}
            onChange={(e) => setMetalName(e.target.value)}
            placeholder="Enter metal name"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* METAL CODE */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">
            Metal Code :
          </label>
          <input
            value={metalCode}
            onChange={(e) => setMetalCode(e.target.value)}
            placeholder="Enter metal code"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* SUBMIT */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-gray-800 text-white px-4 py-2 rounded"
          >
            {editId ? "Update" : "Submit"}
          </button>
        </div>

        {/* RESET */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => {
              setMetalName("");
              setMetalCode("");
              setEditId(null);
            }}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#b08a5a] text-white">
            <tr>
              <th className="p-3 text-left">Metal Name</th>
              <th className="p-3 text-left">Metal Code</th>
              <th className="p-3 text-left">Edit</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMetals.map((metal) => (
              <tr key={metal.id} className="border-t">
                <td className="p-3">{metal.name}</td>
                <td className="p-3">{metal.code}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(metal)}
                    className="text-lg"
                  >
                    ✏️
                  </button>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={metal.checked}
                    onChange={() => toggleCheck(metal.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DELETE ================= */}
      <button
        onClick={handleDelete}
        className="bg-gray-800 text-white px-4 py-2 rounded"
      >
        delete
      </button>

      {/* ================= PAGINATION + PAGE SIZE ================= */}
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
              onChange={(e) =>
                setItemsPerPage(Number(e.target.value))
              }
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
