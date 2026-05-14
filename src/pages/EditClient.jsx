import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

/* TEMP MOCK – replace with API */
const MOCK_CLIENT = {
  id: 1,
  clientName: "ABC Jewellers",
  address: "MG Road, Hyderabad",
  pincode: "500001",
  country: "India",
  state: "Telangana",
  city: "Hyderabad",
  otherCity: "",
  retailer: "Yes",
  supplier: "No",
  depositorName: "Ramesh",
  mobile: "9876543210",
  email: "abc@gmail.com",
  pan: "ABCDE1234F",
  tan: "TAN12345",
  gstin: "36ABCDE1234F1Z5",
};

export default function EditClient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(MOCK_CLIENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* LOAD CLIENT (API later) */
  useEffect(() => {
    // fetch(`/api/clients/${id}`)
    //   .then(res => res.json())
    //   .then(data => setForm(data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* PINCODE SEARCH */
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
        const po = data[0].PostOffice[0];
        setForm((prev) => ({
          ...prev,
          country: po.Country,
          state: po.State,
          city: po.District,
        }));
      } else {
        setError("Invalid Pincode");
      }
    } catch {
      setError("Failed to fetch pincode details");
    }

    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Client:", form);

    // API PUT call here
    // navigate("/view-client");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Edit Client</h1>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/view-client")}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Update Client
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg">{error}</div>
      )}

      {/* BASIC INFO */}
      <Section title="Basic Information">
        <Input
          label="Client Name"
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
        />
        <Input
          label="Mobile Number"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
        />
        <Textarea
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          span
        />
      </Section>

      {/* LOCATION */}
      <Section title="Location Details">
        <Input
          label="Pincode"
          name="pincode"
          value={form.pincode}
          onChange={(e) => {
            handleChange(e);
            handlePincode(e.target.value);
          }}
        />
        <Input label="Country" value={form.country} disabled />
        <Input label="State" value={form.state} disabled />
        <Input label="City" value={form.city} disabled />
        <Input
          label="Other City"
          name="otherCity"
          value={form.otherCity}
          onChange={handleChange}
        />
      </Section>

      {/* BUSINESS */}
      <Section title="Business Details">
        <Input
          label="Retailer"
          name="retailer"
          value={form.retailer}
          onChange={handleChange}
        />
        <Input
          label="Supplier"
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
        />
        <Input
          label="Depositor Name"
          name="depositorName"
          value={form.depositorName}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </Section>

      {/* TAX */}
      <Section title="Tax Information">
        <Input
          label="PAN Number"
          name="pan"
          value={form.pan}
          onChange={handleChange}
        />
        <Input
          label="TAN Number"
          name="tan"
          value={form.tan}
          onChange={handleChange}
        />
        <Input
          label="GSTIN"
          name="gstin"
          value={form.gstin}
          onChange={handleChange}
          span
        />
      </Section>
    </form>
  );
}

/* 🔹 REUSABLE UI COMPONENTS */
function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({ label, span, ...props }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input {...props} className="input" />
    </div>
  );
}

function Textarea({ label, span, ...props }) {
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      <textarea {...props} rows="3" className="input" />
    </div>
  );
}
