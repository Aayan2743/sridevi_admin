import { useState, useRef } from "react";

export default function CategoryPills({ items, active, onChange }) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef(null);
  const itemsPerPage = 8;

  const itemsArray = items || [];
  const totalPages = Math.ceil(itemsArray.length / itemsPerPage);
  const paginatedItems = itemsArray.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="space-y-3">
      {/* CAROUSEL */}
      <div className="flex items-center gap-2">
        {/* LEFT ARROW */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="flex-shrink-0 p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white h-10 w-10 flex items-center justify-center"
        >
          ◀
        </button>

        {/* CAROUSEL CONTAINER */}
        <div
          ref={containerRef}
          className="flex gap-2 flex-1 overflow-hidden"
        >
          {paginatedItems.map((item) => {
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`
                  flex flex-col items-center
                  w-[100px]
                  px-2 py-2
                  rounded-xl border transition flex-shrink-0
                  ${
                    isActive
                      ? "bg-green-50 border-green-600"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                {/* IMAGE */}
                <div
                  className={`
                    w-12 h-12 rounded-full
                    overflow-hidden
                    border
                    ${isActive ? "border-green-600" : "border-gray-200"}
                  `}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                      N/A
                    </div>
                  )}
                </div>

                {/* LABEL */}
                <span className="text-[10px] mt-2 font-medium leading-tight text-center line-clamp-2">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT ARROW */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex-shrink-0 p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white h-10 w-10 flex items-center justify-center"
        >
          ▶
        </button>
      </div>

      {/* BULLET INDICATORS */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition ${
                i === currentPage
                  ? "bg-green-600 w-6"
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
