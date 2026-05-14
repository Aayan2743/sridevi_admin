import { useState } from "react";

export default function AddClient() {
  const [form, setForm] = useState({
    clientName: "",
    address: "",
    pincode: "",
    country: "",
    state: "",
    city: "",
    otherCity: "",
    retailer: "",
    supplier: "",
    depositorName: "",
    mobile: "",
    email: "",
    pan: "",
    tan: "",
    gstin: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔎 PINCODE SEARCH
  const handlePincode = async (pincode) => {
    if (pincode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];

        setForm((prev) => ({
          ...prev,
          country: postOffice.Country,
          state: postOffice.State,
          city: postOffice.District,
        }));
      } else {
        setError("Invalid Pincode");
      }
    } catch {
      setError("Failed to fetch pincode details");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add Client</h1>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Save Client
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg">{error}</div>
      )}

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name</label>
            <input
              name="clientName"
              placeholder="Enter Client Name"
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Mobile Number</label>
            <input
              name="mobile"
              placeholder="Enter Mobile Number"
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Client Address</label>
            <textarea
              name="address"
              rows="3"
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* LOCATION INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Location Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Pincode</label>
            <input
              name="pincode"
              placeholder="Enter Pincode"
              onChange={(e) => {
                handleChange(e);
                handlePincode(e.target.value);
              }}
              className="input"
            />
            {loading && (
              <p className="text-xs text-gray-500 mt-1">Fetching location…</p>
            )}
          </div>

          <div>
            <label className="label">Country</label>
            <input
              value={form.country}
              readOnly
              className="input bg-gray-100"
            />
          </div>

          <div>
            <label className="label">State</label>
            <input value={form.state} readOnly className="input bg-gray-100" />
          </div>

          <div>
            <label className="label">City</label>
            <input value={form.city} readOnly className="input bg-gray-100" />
          </div>

          <div>
            <label className="label">Other City</label>
            <input name="otherCity" onChange={handleChange} className="input" />
          </div>
        </div>
      </div>

      {/* BUSINESS INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Business Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Retailer</label>
            <input name="retailer" onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">Supplier</label>
            <input name="supplier" onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">Depositor Name</label>
            <input
              name="depositorName"
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email ID</label>
            <input name="email" onChange={handleChange} className="input" />
          </div>
        </div>
      </div>

      {/* TAX INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Tax Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">PAN Number</label>
            <input name="pan" onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">TAN Number</label>
            <input name="tan" onChange={handleChange} className="input" />
          </div>

          <div className="md:col-span-3">
            <label className="label">GSTIN Number</label>
            <input name="gstin" onChange={handleChange} className="input" />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">
          Cancel
        </button>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Save Client
        </button>
      </div>
    </div>
  );
}
