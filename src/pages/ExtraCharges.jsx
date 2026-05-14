// import { useState } from "react";

// export default function ExtraCharges() {
//   const [service, setService] = useState("");
//   const [price, setPrice] = useState("");
//   const [comment, setComment] = useState("");

//   // mock list – replace with API
//   const [rows, setRows] = useState([
//     {
//       id: 1,
//       confirmation: "GILCNF1105",
//       service: "Additional Test",
//       price: 10,
//       comment: "Urgent",
//     },
//   ]);

//   const addCharge = () => {
//     if (!service || !price) return;

//     setRows([
//       ...rows,
//       {
//         id: rows.length + 1,
//         confirmation: "GILCNF1105",
//         service,
//         price,
//         comment,
//       },
//     ]);

//     setService("");
//     setPrice("");
//     setComment("");
//   };

//   return (
//     <div className="space-y-6">
//       {/* TITLE */}
//       <h1 className="text-2xl font-bold text-gray-800">
//         Add Additional Charges
//       </h1>

//       {/* INFO */}
//       <p className="text-sm text-gray-600">
//         Invoice Confirmation No : <strong>GILCNF1105</strong>
//       </p>

//       {/* ADD FORM */}
//       <div className="bg-white p-5 rounded-xl shadow grid grid-cols-1 md:grid-cols-5 gap-4">
//         <select
//           value={service}
//           onChange={(e) => setService(e.target.value)}
//           className="input"
//         >
//           <option value="">Select Service</option>
//           <option value="Extra Test">Extra Test</option>
//           <option value="Urgent Service">Urgent Service</option>
//         </select>

//         <input
//           type="number"
//           placeholder="Additional Charges"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="input"
//         />

//         <input
//           placeholder="Extra Comments"
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//           className="input"
//         />

//         <div className="md:col-span-2 flex items-center">
//           <button
//             onClick={addCharge}
//             className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
//           >
//             Add Additional Charges
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100 text-gray-600">
//             <tr>
//               <th className="px-4 py-3 text-left">S.No</th>
//               <th className="px-4 py-3 text-left">Confirmation No</th>
//               <th className="px-4 py-3 text-left">Service</th>
//               <th className="px-4 py-3 text-right">Price</th>
//               <th className="px-4 py-3 text-left">Extra Comment</th>
//               <th className="px-4 py-3 text-center">Actions</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y">
//             {rows.map((row, index) => (
//               <tr key={row.id}>
//                 <td className="px-4 py-3">{index + 1}</td>
//                 <td className="px-4 py-3">{row.confirmation}</td>
//                 <td className="px-4 py-3">{row.service}</td>
//                 <td className="px-4 py-3 text-right">{row.price}</td>
//                 <td className="px-4 py-3">{row.comment}</td>
//                 <td className="px-4 py-3 text-center space-x-3">
//                   <button className="text-indigo-600 hover:underline">
//                     Edit
//                   </button>
//                   <button className="text-red-600 hover:underline">
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* MOBILE VIEW */}
//       <div className="md:hidden space-y-4">
//         {rows.map((row) => (
//           <div
//             key={row.id}
//             className="bg-white p-4 rounded-xl shadow space-y-1"
//           >
//             <p className="font-semibold">{row.service}</p>
//             <p className="text-sm text-gray-600">{row.confirmation}</p>
//             <p className="text-sm">₹ {row.price}</p>
//             <p className="text-sm text-gray-500">{row.comment}</p>

//             <div className="flex gap-4 pt-2">
//               <button className="text-indigo-600 text-sm">Edit</button>
//               <button className="text-red-600 text-sm">Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";

export default function ExtraCharges() {
  const [service, setService] = useState("");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [editId, setEditId] = useState(null);

  const [rows, setRows] = useState([
    {
      id: 1,
      confirmation: "GILCNF1105",
      service: "Additional Test",
      price: 10,
      comment: "Urgent",
    },
  ]);

  /* RESET FORM */
  const resetForm = () => {
    setService("");
    setPrice("");
    setComment("");
    setEditId(null);
  };

  /* ADD / UPDATE */
  const handleSubmit = () => {
    if (!service || !price) return;

    if (editId) {
      // UPDATE
      setRows(
        rows.map((row) =>
          row.id === editId ? { ...row, service, price, comment } : row
        )
      );
    } else {
      // ADD
      setRows([
        ...rows,
        {
          id: Date.now(),
          confirmation: "GILCNF1105",
          service,
          price,
          comment,
        },
      ]);
    }

    resetForm();
  };

  /* EDIT */
  const handleEdit = (row) => {
    setEditId(row.id);
    setService(row.service);
    setPrice(row.price);
    setComment(row.comment);
  };

  /* DELETE */
  const handleDelete = (id) => {
    if (!confirm("Delete this charge?")) return;
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">
        Add Additional Charges
      </h1>

      <p className="text-sm text-gray-600">
        Invoice Confirmation No : <strong>GILCNF1105</strong>
      </p>

      {/* FORM */}
      <div className="bg-white p-5 rounded-xl shadow grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="input"
        >
          <option value="">Select Service</option>
          <option value="Extra Test">Extra Test</option>
          <option value="Urgent Service">Urgent Service</option>
        </select>

        <input
          type="number"
          placeholder="Additional Charges"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input"
        />

        <input
          placeholder="Extra Comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input"
        />

        <div className="md:col-span-2 flex gap-3 items-center">
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white ${
              editId
                ? "bg-green-600 hover:bg-green-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {editId ? "Update Charge" : "Add Additional Charges"}
          </button>

          {editId && (
            <button onClick={resetForm} className="border px-6 py-2 rounded-lg">
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Confirmation</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{row.confirmation}</td>
                <td className="px-4 py-3">{row.service}</td>
                <td className="px-4 py-3 text-right">{row.price}</td>
                <td className="px-4 py-3">{row.comment}</td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button
                    onClick={() => handleEdit(row)}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white p-4 rounded-xl shadow space-y-1"
          >
            <p className="font-semibold">{row.service}</p>
            <p className="text-sm text-gray-600">{row.confirmation}</p>
            <p className="text-sm">₹ {row.price}</p>
            <p className="text-sm text-gray-500">{row.comment}</p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => handleEdit(row)}
                className="text-indigo-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
