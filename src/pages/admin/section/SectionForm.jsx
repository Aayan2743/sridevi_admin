import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const SectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState(1);

  useEffect(() => {
    if (id) {
      api.get(`/admin-dashboard/get-footer-sections?page=1`).then(res => {
        const section = res.data.find(s => s.id == id);
        if (section) {
          setName(section.name);
          setStatus(section.status);
        }
      });
    }
  }, [id]);

  const submit = (e) => {
    e.preventDefault();

    const payload = { name, status };

    if (id) {
      api.post(`/admin-dashboard/update-footer-sections/${id}`, payload)
        .then(() => navigate("/admin/sections"));
    } else {
      api.post("/admin-dashboard/add-footer-sections", payload)
        .then(() => navigate("/admin/sections"));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-lg bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {id ? "Edit Section" : "Create Section"}
        </h2>

        <form onSubmit={submit} className="space-y-4">

          <input
            type="text"
            placeholder="Section Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

        </form>
      </div>
    </div>
  );
};

export default SectionForm;