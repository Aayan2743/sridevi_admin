import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthContext";

import { toast } from "react-hot-toast";
import api from "../api/axios";
import SettingsLayout from "./settings/SettingsLayout";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import AccessDenied from "./components/AccessDenied";

export default function SectionManager() {

    const { can,permissions } = useAuth();
  console.log("User Permissions dfdfdfdf:",can);
  console.log("User Permissions array:",permissions);


  const emptyForm = {
    name: "",

    status: 1,
  };

  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  /* ================= FETCH ================= */
  const fetchSections_old = async () => {
    try {
      const res = await api.get("/admin-dashboard/sections");
      setSections(res.data.data || []);
    } catch {
      toast.error("Failed to fetch sections");
    }
  };


  const fetchSections = async () => {
  try {
    const res = await api.get("/admin-dashboard/sections");

    const sorted = (res.data.data || []).sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    setSections(sorted);
  } catch {
    toast.error("Failed to fetch sections");
  }
};

  useEffect(() => {
    fetchSections();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setOpenDrawer(true);
  };

  const handleEdit = (section) => {
    setForm({
      name: section.name,
      slug: section.slug,
      status: section.status,
      sort_order: section.sort_order,
    });
    setEditId(section.id);
    setOpenDrawer(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (editId) {
        await api.post(`/admin-dashboard/upate-sections/${editId}`, form);
        toast.success("Section updated");
      } else {
        await api.post("/admin-dashboard/sections", form);
        toast.success("Section created");
      }

      setOpenDrawer(false);
      fetchSections();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save section");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section?")) return;

    try {
      await api.delete(`/admin-dashboard/sections/${id}`);
      toast.success("Section deleted");
      fetchSections();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ================= UI ================= */

  const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const items = Array.from(sections);
  const [movedItem] = items.splice(result.source.index, 1);

  items.splice(result.destination.index, 0, movedItem);

  setSections(items);

  // Prepare payload
  const order = items.map((item, index) => ({
    id: item.id,
    position: index + 1,
  }));

  try {
    await api.post("/admin-dashboard/sections/sort", { order });
    toast.success("Order updated");
  } catch {
    toast.error("Failed to update order");
  }
};

   if (!can("settings.product_section_view")) {
    return (
      
         <SettingsLayout>
      <>
        <AccessDenied />
      </>
      </SettingsLayout>
    );
  }



  return (
    <SettingsLayout>
      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Sections</h2>
            <p className="text-sm text-gray-500">
              Manage homepage product sections
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            + Add Section
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">S No</th>
                <th className="px-4 py-3 text-left">Name</th>
                {/* <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Order</th> */}

                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            {/* <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.slug}</td>
                  <td className="px-4 py-3">{s.position}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        s.status == 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status == 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {sections.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
                    No sections found
                  </td>
                </tr>
              )}
            </tbody> */}

       
   <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="sections">
    {(provided) => (
      <tbody ref={provided.innerRef} {...provided.droppableProps}>
        {sections.map((s, index) => (
          <Draggable
            key={s.id}
            draggableId={s.id.toString()}
            index={index}
          >
            {(provided) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                className="border-t hover:bg-indigo-50 transition group"
              >
                {/* DRAG ICON */}
                <td
                  {...provided.dragHandleProps}
                  className="px-3 py-3 text-gray-400 cursor-grab"
                >
                  ☰
                </td>

                {/* NAME */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {s.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {s.slug}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      s.status == 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status == 1 ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-4 py-3 space-x-3">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </tbody>
    )}
  </Droppable>
</DragDropContext>
          </table>
        </div>

        {/* DRAWER */}
        {openDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpenDrawer(false)}
            />

            <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editId ? "Edit Section" : "Add Section"}
                </h3>
                <button
                  onClick={() => setOpenDrawer(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  {loading
                    ? "Saving..."
                    : editId
                      ? "Update Section"
                      : "Create Section"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </SettingsLayout>
  );
}
