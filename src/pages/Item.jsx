import { useEffect, useState } from "react";

export default function Item() {
/* ================= DATA ================= */
const [items, setItems] = useState([
{ id: 1, name: "Set of Bangles", code: "SOB", checked: false },
{ id: 2, name: "Jewellery", code: "JL", checked: false },
{ id: 3, name: "Pendant & Earrings", code: "P-E", checked: false },
{ id: 4, name: "Pendant", code: "PD", checked: false },
{ id: 5, name: "Ring", code: "RG", checked: false },
{ id: 6, name: "Bracelet", code: "BR", checked: false },
]);

/* ================= FORM ================= */
const [itemName, setItemName] = useState("");
const [itemCode, setItemCode] = useState("");
const [editId, setEditId] = useState(null);

/* ================= PAGINATION ================= */
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(5);

const totalPages = Math.ceil(items.length / itemsPerPage);

const paginatedItems = items.slice(
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
if (!itemName.trim() || !itemCode.trim()) return;

if (editId) {
setItems((prev) =>
prev.map((i) =>
i.id === editId
? { ...i, name: itemName, code: itemCode }
: i
)
);
setEditId(null);
} else {
setItems((prev) => [
...prev,
{
id: Date.now(),
name: itemName,
code: itemCode,
checked: false,
},
]);
}

setItemName("");
setItemCode("");
};

/* ================= EDIT ================= */
const handleEdit = (item) => {
setItemName(item.name);
setItemCode(item.code);
setEditId(item.id);
};

/* ================= CHECKBOX ================= */
const toggleCheck = (id) => {
setItems((prev) =>
prev.map((i) =>
i.id === id ? { ...i, checked: !i.checked } : i
)
);
};

/* ================= DELETE ================= */
const handleDelete = () => {
setItems((prev) => prev.filter((i) => !i.checked));
};

return (
<div className="space-y-6">
  {/* ================= HEADER ================= */}
  <h1 className="text-xl font-semibold flex items-center gap-2">
    📁 Item
  </h1>

  {/* ================= FORM ================= */}
  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded">
    {/* ITEM NAME */}
    <div className="md:col-span-4">
      <label className="block text-sm font-medium mb-1">
        Item name :
      </label>
      <input value={itemName} onChange={(e)=> setItemName(e.target.value)}
      placeholder="Enter item name"
      className="w-full border rounded px-3 py-2"
      />
    </div>

    {/* ITEM CODE */}
    <div className="md:col-span-3">
      <label className="block text-sm font-medium mb-1">
        Item Code :
      </label>
      <input value={itemCode} onChange={(e)=> setItemCode(e.target.value)}
      placeholder="Enter item code"
      className="w-full border rounded px-3 py-2"
      />
    </div>

    {/* SUBMIT */}
    <div className="md:col-span-2">
      <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded">
        {editId ? "Update" : "Submit"}
      </button>
    </div>

    {/* RESET */}
    <div className="md:col-span-2">
      <button type="button" onClick={()=> {
        setItemName("");
        setItemCode("");
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
          <th className="p-3 text-left">Item Name</th>
          <th className="p-3 text-left">Item Code</th>
          <th className="p-3 text-left">Edit</th>
          <th className="p-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {paginatedItems.map((item) => (
        <tr key={item.id} className="border-t">
          <td className="p-3">{item.name}</td>
          <td className="p-3">{item.code}</td>
          <td className="p-3">
            <button onClick={()=> handleEdit(item)}
              className="text-lg"
              >
              ✏️
            </button>
          </td>
          <td className="p-3">
            <input type="checkbox" checked={item.checked} onChange={()=> toggleCheck(item.id)}
            />
          </td>
        </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* ================= DELETE ================= */}
  <button onClick={handleDelete} className="bg-gray-800 text-white px-4 py-2 rounded">
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
        <select value={itemsPerPage} onChange={(e)=> setItemsPerPage(Number(e.target.value))}
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
      <button disabled={currentPage===1} onClick={()=> setCurrentPage((p) => p - 1)}
        className={`px-4 py-2 rounded border text-sm
        ${
        currentPage === 1
        ? "text-gray-400 cursor-not-allowed bg-white"
        : "hover:bg-gray-100"
        }`}
        >
        Prev
      </button>

      <button disabled={currentPage===totalPages} onClick={()=> setCurrentPage((p) => p + 1)}
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