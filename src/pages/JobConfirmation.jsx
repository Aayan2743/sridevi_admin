import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JobConfirmation() {
  const { id } = useParams(); // 👈 detect edit
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    client: "",
    banner: "",
    items: [{ item: "", pieces: "", weight: "", service: "" }],
    depositor: "",
    receiver: "",
    invoiceDate: "",
    deliveryDate: "",
  });

  /* LOAD DATA WHEN EDIT */
  useEffect(() => {
    if (isEdit) {
      // API CALL LATER
      const existingData = {
        client: "Rajdeep Jewellers",
        banner: "Logo 1",
        items: [
          { item: "Ring", pieces: 2, weight: 15, service: "Gold Test" },
          { item: "Chain", pieces: 1, weight: 25, service: "Certification" },
        ],
        depositor: "Ramesh",
        receiver: "Suresh",
        invoiceDate: "2025-12-10",
        deliveryDate: "2025-12-12",
      };

      setForm(existingData);
    }
  }, [id, isEdit]);

  /* ADD ITEM */
  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { item: "", pieces: "", weight: "", service: "" }],
    });
  };

  /* UPDATE ITEM */
  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  /* SUBMIT */
  const handleSubmit = () => {
    if (isEdit) {
      console.log("UPDATE CONFIRMATION", form);
      // PUT /confirmation/:id
    } else {
      console.log("CREATE CONFIRMATION", form);
      // POST /confirmation
    }

    navigate("/confirmation-list");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Job Confirmation" : "Job Confirmation"}
      </h1>

      {/* CLIENT */}
      <Card>
        <Grid>
          <Field label="Client Name">
            <select
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className="input"
            >
              <option>- Select Client -</option>
              <option>Rajdeep Jewellers</option>
            </select>
          </Field>

          <Field label="Client Banner Logo">
            <select className="input">
              <option>Select Client First</option>
            </select>
          </Field>
        </Grid>
      </Card>

      {/* ITEMS */}
      <Card title="Items Details">
        <div className="flex justify-end mb-4">
          <button
            onClick={addItem}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>No. of Pieces</th>
                <th>Weight (g)</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <select
                      value={row.item}
                      onChange={(e) => updateItem(i, "item", e.target.value)}
                      className="input"
                    >
                      <option>- Select Item -</option>
                      <option>Ring</option>
                      <option>Chain</option>
                    </select>
                  </td>
                  <td>
                    <input
                      value={row.pieces}
                      onChange={(e) => updateItem(i, "pieces", e.target.value)}
                      className="input"
                    />
                  </td>
                  <td>
                    <input
                      value={row.weight}
                      onChange={(e) => updateItem(i, "weight", e.target.value)}
                      className="input"
                    />
                  </td>
                  <td>
                    <select
                      value={row.service}
                      onChange={(e) => updateItem(i, "service", e.target.value)}
                      className="input"
                    >
                      <option>- Select Service -</option>
                      <option>Gold Test</option>
                      <option>Certification</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DELIVERY */}
      <Card>
        <Grid>
          <Field label="Depositor Name">
            <input
              value={form.depositor}
              onChange={(e) => setForm({ ...form, depositor: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Receiver Name">
            <input
              value={form.receiver}
              onChange={(e) => setForm({ ...form, receiver: e.target.value })}
              className="input"
            />
          </Field>

          <Field label="Invoice Date">
            <input
              type="date"
              value={form.invoiceDate}
              onChange={(e) =>
                setForm({ ...form, invoiceDate: e.target.value })
              }
              className="input"
            />
          </Field>

          <Field label="Delivery Date">
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) =>
                setForm({ ...form, deliveryDate: e.target.value })
              }
              className="input"
            />
          </Field>
        </Grid>
      </Card>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          {isEdit ? "Update Job" : "Submit Job"}
        </button>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */
function Card({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
