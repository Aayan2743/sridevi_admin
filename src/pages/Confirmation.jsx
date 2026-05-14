import { useState } from "react";

const ITEMS = ["Ring", "Chain", "Bracelet", "Pendant"];
const SERVICES = ["Gold Test", "Diamond Test", "Certification"];

export default function Confirmation() {
  const [rows, setRows] = useState([
    { item: "", pieces: "", weight: "", service: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { item: "", pieces: "", weight: "", service: "" }]);
  };

  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold text-gray-800">Job Confirmation</h1>

      {/* CLIENT SECTION */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Client Name</label>
          <select className="input">
            <option>- Select Client -</option>
          </select>
        </div>

        <div>
          <label className="label">Client Banner Logo</label>
          <select className="input">
            <option>Select Client First</option>
          </select>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Items Details</h2>
          <button
            onClick={addRow}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + Add Item
          </button>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3">No. of Pieces</th>
                <th className="px-4 py-3">Weight (g)</th>
                <th className="px-4 py-3 text-left">Service</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-center">{i + 1}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input"
                      value={row.item}
                      onChange={(e) => updateRow(i, "item", e.target.value)}
                    >
                      <option>- Select Item -</option>
                      {ITEMS.map((it) => (
                        <option key={it}>{it}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="input"
                      value={row.pieces}
                      onChange={(e) => updateRow(i, "pieces", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="input"
                      value={row.weight}
                      onChange={(e) => updateRow(i, "weight", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input"
                      value={row.service}
                      onChange={(e) => updateRow(i, "service", e.target.value)}
                    >
                      <option>- Select Service -</option>
                      {SERVICES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4 p-4">
          {rows.map((row, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Item #{i + 1}</p>
              <select className="input">- Select Item -</select>
              <input className="input" placeholder="No. of Pieces" />
              <input className="input" placeholder="Weight" />
              <select className="input">- Select Service -</select>
            </div>
          ))}
        </div>
      </div>

      {/* DELIVERY INFO */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Depositor Name</label>
          <input className="input" />
        </div>

        <div>
          <label className="label">Receiver Name</label>
          <input className="input" />
        </div>

        <div>
          <label className="label">Invoice Date</label>
          <input type="date" className="input" />
        </div>

        <div>
          <label className="label">Delivery Date</label>
          <input type="date" className="input" />
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 border rounded-lg">Cancel</button>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Submit Job
        </button>
      </div>
    </div>
  );
}
