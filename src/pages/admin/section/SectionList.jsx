import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import Pagination from "../../components/Pagination";
import SettingsLayout from "../../settings/SettingsLayout";
// import Pagination from "../../../components/Pagination";
// import SettingsLayout from "./settings/SettingsLayout";
import { toast } from "react-hot-toast";

const SectionList = () => {
  const [sections, setSections] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
const [editingSection, setEditingSection] = useState(null);
const [formData, setFormData] = useState({
  name: "",
  status: 1
});

  const fetchSections = (page = 1) => {
    setLoading(true);
    api.get(`/admin-dashboard/get-footer-sections?page=${page}`)
      .then(res => {
        setSections(res.data);
        setPagination(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const deleteSection = (id) => {
    if (!window.confirm("Delete this section?")) return;
    api.delete(`/sections/${id}`).then(() => fetchSections());
  };

  const toggleStatus = (section) => {
    api.put(`/sections/${section.id}`, {
      name: section.name,
      status: section.status ? 0 : 1
    }).then(() => fetchSections());
  };


  const handleSubmitss = (e) => {
  e.preventDefault();

  if (editingSection) {
    api.post(`/admin-dashboard/update-footer-sections/${editingSection.id}`, formData)
      .then(() => {
        fetchSections();
        setDrawerOpen(false);
      });
  } else {
    api.post(`/admin-dashboard/add-footer-sections`, formData)
      .then(() => {
        fetchSections();
        setDrawerOpen(false);
      });
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let response;

    if (editingSection) {
      response = await api.post(
        `/admin-dashboard/update-footer-sections/${editingSection.id}`,
        formData
      );
    } else {
      response = await api.post(
        `/admin-dashboard/add-footer-sections`,
        formData
      );
    }

    toast.success(response?.data?.message || "Success");

    fetchSections();
    setDrawerOpen(false);

  } catch (error) {

    if (error.response?.status === 422) {
      toast.error(error.response.data.message);
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong");
    }
  }
};

  return (

    <SettingsLayout>
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-5">
        <h2 className="text-2xl font-bold">Footer Sections</h2>
       <button
            onClick={() => {
                setEditingSection(null);
                setFormData({ name: "", status: 1 });
                setDrawerOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            >
            Add Section
            </button>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id} className="border-t">
                <td className="p-3">{section.name}</td>

               <td>
  <span
    onClick={() => toggleStatus(section)} // remove this line if you don't want toggle
    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition ${
      section.status == 1
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {section.status == 1 ? "Active" : "Inactive"}
  </span>
</td>

                <td className="space-x-3">
                  {/* <Link
                    to={`/admin/sections/edit/${section.id}`}
                    className="text-blue-500"
                  >
                    Edit
                  </Link> 
                  
                  */}


                        <button
                        onClick={() => {
                            setEditingSection(section);
                            setFormData({
                            name: section.name,
                            status: section.status
                            });
                            setDrawerOpen(true);
                        }}
                        className="text-blue-500"
                        >
                        Edit
                        </button>
                  {/* <button
                    onClick={() => deleteSection(section.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination pagination={pagination} onPageChange={fetchSections} />
        
      </div>
    </div>

    {/* Right Drawer */}
<div
  className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ${
    drawerOpen ? "translate-x-0" : "translate-x-full"
  }`}
>
  <div className="p-6 border-b flex justify-between items-center">
    <h3 className="text-xl font-semibold">
      {editingSection ? "Edit Section" : "Add Section"}
    </h3>
    <button onClick={() => setDrawerOpen(false)}>✕</button>
  </div>

  <form onSubmit={handleSubmit} className="p-6 space-y-4">
    
    {/* Name */}
    <div>
      <label className="block mb-1 font-medium">Section Name</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
        required
      />
    </div>

    {/* Status */}
    <div>
      <label className="block mb-1 font-medium">Status</label>
      <select
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      >
        <option value={1}>Active</option>
        <option value={0}>Inactive</option>
      </select>
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setDrawerOpen(false)}
        className="px-4 py-2 border rounded"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {editingSection ? "Update" : "Save"}
      </button>
    </div>
  </form>
</div>
    </SettingsLayout>
  );
};

export default SectionList;