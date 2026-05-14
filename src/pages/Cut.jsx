import { useEffect, useState } from "react";

export default function Cut() {
  /* ================= DATA ================= */
  const [cuts, setCuts] = useState([
    {
      id: 1,
      name: "Baguette, Marquise, Pear & Emerald",
      code: "B-MQ-PR-EM",
      checked: false,
    },
    {
      id: 2,
      name: "Round Brilliant, Baguette, Pear & Oval",
      code: "RBC-B-PR-OV",
      checked: false,
    },
    { id: 3, name: "Pear & Oval", code: "PR-OV", checked: false },
    { id: 4, name: "Old European Cut", code: "OEC", checked: false },
  ]);

  /* ================= FORM ================= */
  const [cutName, setCutName] = useState("");
  const [cutCode, setCutCode] = useState("");
  const [editId, setEditId] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(cuts.length / itemsPerPage);

  const paginatedCuts = cuts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* Reset page on page-size change */
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cutName.trim() || !cutCode.trim()) return;

    if (editId) {
      setCuts((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...c, name: cutName, code: cutCode }
            : c
        )
      );
      setEditId(null);
    } else {
      setCuts((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: cutName,
          code: cutCode,
          checked: false,
        },
      ]);
    }

    setCutName("");
    setCutCode("");
  };

  /* ================= EDIT ================= */
  const handleEdit = (cut) => {
    setCutName(cut.name);
    setCutCode(cut.code);
    setEditId(cut.id);
  };

  /* ================= CHECKBOX ================= */
  const toggleCheck = (id) => {
    setCuts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, checked: !c.checked } : c
      )
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = () => {
    setCuts((prev) => prev.filter((c) => !c.checked));
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-xl font-semibold flex items-center gap-2">
        📁 Cut
      </h1>

      {/* ================= SINGLE LINE FORM ================= */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded"
      >
        {/* CUT NAME */}
        <div className="md:col-span-5">
          <label className="block text-sm font-medium mb-1">
            Cut name :
          </label>
          <input
            value={cutName}
            onChange={(e) => setCutName(e.target.value)}
            placeholder="Enter cut name"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* CUT CODE */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">
            Cut Code :
          </label>
          <input
            value={cutCode}
            onChange={(e) => setCutCode(e.target.value)}
            placeholder="Enter cut code"
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
              setCutName("");
              setCutCode("");
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
              <th className="p-3 text-left">Cut Name</th>
              <th className="p-3 text-left">Cut Code</th>
              <th className="p-3 text-left">Edit</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCuts.map((cut) => (
              <tr key={cut.id} className="border-t">
                <td className="p-3">{cut.name}</td>
                <td className="p-3">{cut.code}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(cut)}
                    className="text-lg"
                  >
                    ✏️
                  </button>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={cut.checked}
                    onChange={() => toggleCheck(cut.id)}
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
