import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

const BlogDragDrop = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/blogs?per_page=100").then(res => {
      setBlogs(res.data.data.data);
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(blogs);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setBlogs(reordered);

    const payload = reordered.map((item, index) => ({
      id: item.id,
      order_by: index + 1
    }));

    api.post("/blogs-reorder", payload);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="blogs">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {blogs.map((blog, index) => (
              <Draggable
                key={blog.id}
                draggableId={blog.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-3 border mb-2 bg-white shadow"
                  >
                    {blog.title}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default BlogDragDrop;