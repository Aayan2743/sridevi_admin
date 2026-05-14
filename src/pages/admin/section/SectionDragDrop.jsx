import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import SettingsLayout from "../../settings/SettingsLayout";
import { toast } from "react-hot-toast";


const SectionDragDrop = () => {
  const [sections, setSections] = useState([]);

  // useEffect(() => {
  //   api.get("/admin-dashboard/get-footer-sections?per_page=100")
  //     .then(res => setSections(res.data));
  // }, []);


  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get(
        "/admin-dashboard/get-footer-sections?per_page=100"
      );
      setSections(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load sections"
      );
    }
  };

  fetchData();
}, []);

  const onDragEnds = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setSections(reordered);

    const payload = reordered.map((item, index) => ({
      id: item.id,
      order_by: index + 1
    }));

    api.post("/admin-dashboard/reordering-footer-sections", payload);
  };

  const onDragEnd = async (result) => {
  if (!result.destination) return;

  const reordered = Array.from(sections);
  const [removed] = reordered.splice(result.source.index, 1);
  reordered.splice(result.destination.index, 0, removed);

  setSections(reordered);

  const payload = reordered.map((item, index) => ({
    id: item.id,
    order_by: index + 1
  }));

  try {
    const response = await api.post(
      "/admin-dashboard/reordering-footer-sections",
      payload
    );

    toast.success(
      response?.data?.message || "Sections reordered successfully"
    );

  } catch (error) {

    toast.error(
      error.response?.data?.message || "Reordering failed"
    );
  }
};

  return (
  <SettingsLayout>
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Reorder Sections
            </h2>
            <p className="text-sm text-gray-500">
              Drag and drop to rearrange footer section order
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {sections.map((section, index) => (
                    <Draggable
                      key={section.id}
                      draggableId={section.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 
                          ${
                            snapshot.isDragging
                              ? "bg-blue-50 shadow-lg scale-[1.02]"
                              : "bg-gray-50 hover:bg-gray-100 hover:shadow"
                          }`}
                        >
                          {/* Left Side */}
                          <div className="flex items-center gap-4">
                            
                            {/* Order Badge */}
                            <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold bg-blue-100 text-blue-700 rounded-full">
                              {index + 1}
                            </span>

                            {/* Section Name */}
                            <span className="font-medium text-gray-700">
                              {section.name}
                            </span>
                          </div>

                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 group-hover:text-blue-500 transition"
                          >
                            ☰
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

        </div>
      </div>
    </div>
  </SettingsLayout>
);
};

export default SectionDragDrop;