import { useState } from "react";

export default function JewelleryJobCard() {
  const [activeTab, setActiveTab] = useState("entry");

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-xl font-semibold flex items-center gap-2">
        📁 Jewellery Job Card
      </h1>

      {/* ================= TABS ================= */}
      <div className="flex gap-2 border-b">
        <TabButton
          active={activeTab === "entry"}
          onClick={() => setActiveTab("entry")}
        >
          Job Card Entry
        </TabButton>

        <TabButton
          active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
        >
          Job Card List
        </TabButton>

        <TabButton
          active={activeTab === "image"}
          onClick={() => setActiveTab("image")}
        >
          Image Upload
        </TabButton>
      </div>

      {/* ================= CONTENT ================= */}
      {activeTab === "entry" && <JobCardEntry />}
      {activeTab === "list" && <JobCardList />}
      {activeTab === "image" && <JobCardImageUpload />}
    </div>
  );
}

/* =====================================================
   TAB BUTTON
===================================================== */
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 ${
        active
          ? "border-indigo-600 text-indigo-600"
          : "border-transparent text-gray-600 hover:text-indigo-600"
      }`}
    >
      {children}
    </button>
  );
}



function JobCardEntry() {
  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="font-semibold text-lg">
        📄 Jewellery Job Card Entry Form
      </h2>

      <div className="flex items-center gap-4">
        <input type="file" className="border rounded px-3 py-2" />
        <button className="bg-gray-800 text-white px-6 py-2 rounded">
          Submit
        </button>
      </div>
    </div>
  );
}



function JobCardList() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        📋 Jewellery Job Card List
      </h2>

      {/* FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
        <input
          placeholder="Confirmation Number"
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Job Card Id"
          className="border px-3 py-2 rounded"
        />
        <button className="bg-gray-800 text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#b08a5a] text-white">
            <tr>
              <th className="p-3">SNo</th>
              <th className="p-3">Confirmation No</th>
              <th className="p-3">Jobcard Id</th>
              <th className="p-3">Edit</th>
              <th className="p-3">Delete</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{i}</td>
                <td className="p-3">GILCNF77{i}</td>
                <td className="p-3">GILHJ309{i}K</td>
                <td className="p-3 text-blue-600 cursor-pointer">
                  Edit
                </td>
                <td className="p-3 text-red-600 cursor-pointer">
                  Delete
                </td>
                <td className="p-3">
                  <input type="checkbox" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function JobCardImageUpload() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        🖼 Jewellery Card Image Upload
      </h2>

      {/* SEARCH */}
      <div className="flex gap-4 bg-gray-50 p-4 rounded">
        <input
          placeholder="Old Confirmation Number"
          className="border px-3 py-2 rounded"
        />
        <button className="bg-gray-800 text-white px-4 py-2 rounded">
          Submit
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#b08a5a] text-white">
            <tr>
              <th className="p-3">SNo</th>
              <th className="p-3">Confirmation No</th>
              <th className="p-3">Jobcard Id</th>
              <th className="p-3">Edit</th>
              <th className="p-3">File Upload</th>
              <th className="p-3">Filename</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{i}</td>
                <td className="p-3">GILCNF77{i}</td>
                <td className="p-3">GILHJ309{i}K</td>
                <td className="p-3 text-blue-600 cursor-pointer">
                  edit
                </td>
                <td className="p-3">
                  <input type="file" />
                </td>
                <td className="p-3 text-gray-500">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
