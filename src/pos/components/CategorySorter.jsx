import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import {
  showSuccessToast,
  showErrorToast,
  showLoader,
  closeLoader,
} from "../../utils/swal";

import { CSS } from "@dnd-kit/utilities";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import AccessDenied from "../../pages/components/AccessDenied";


// 🔹 Sortable Item Component
function SortableItem({ id, name, isActivePos, canDrag, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isInactive = isActivePos == 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-3 flex items-center justify-between rounded-2xl border p-3 transition ${
        isDragging
          ? "border-indigo-300 bg-indigo-50 shadow-md"
          : isInactive
            ? "border-rose-200 bg-rose-50/70 opacity-80"
            : "border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          {index + 1}
        </span>
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <p className={`text-xs ${isInactive ? "text-rose-600" : "text-emerald-600"}`}>
            {isInactive ? "POS Disabled" : "POS Active"}
          </p>
        </div>
      </div>

      <span
        {...(canDrag ? attributes : {})}
        {...(canDrag ? listeners : {})}
        className={`rounded-lg px-3 py-1 text-sm font-bold transition ${
          canDrag
            ? "cursor-grab bg-slate-100 text-slate-700 hover:bg-slate-200 active:cursor-grabbing"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        ☰
      </span>
    </div>
  );
}

// 🔹 Main Component
export default function CategorySorter() {
  const { can } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch categories
  useEffect(() => {
    api.get("/admin-dashboard/list-category-all-sort")
      .then((res) => {
        const data = res.data.data || [];
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
        showErrorToast("Failed to load categories");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ Drag End Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(
      (c) => c.id.toString() === active.id
    );

    const newIndex = categories.findIndex(
      (c) => c.id.toString() === over.id
    );

    if (oldIndex === newIndex) return;

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);

    const payload = newOrder.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    showLoader("Saving order...");

    api.post("/admin-dashboard/update-category-order", { order: payload })
      .then(() => {
        closeLoader();
        showSuccessToast("Order updated");
      })
      .catch((err) => {
        console.error(err);
        closeLoader();
        showErrorToast("Failed to save order");
      });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading categories...</p>
      </div>
    );
  }

  if (!can("category_sorter.view")) {
    return (
      <AccessDenied />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50/40 p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Drag & Drop Categories</h3>
        <p className="mt-1 text-sm text-slate-500">
          Reorder POS categories with a smooth drag-and-drop flow.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Total: {categories.length}
          </span>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Drag: {can("category_sorter.drag") ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">No categories available</p>
            <p className="mt-1 text-xs text-slate-500">
              Add categories first, then return here to reorder them.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Drag by handle to reorder. Inactive POS categories are highlighted.
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id.toString())}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category, index) => (
                  <SortableItem
                    key={category.id}
                    id={category.id.toString()}
                    name={category.name}
                    isActivePos={category.is_active_pos}
                    canDrag={can("category_sorter.drag")}
                    index={index}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
}