// const Pagination = ({ pagination, onPageChange }) => {
//   return (
//     <div className="flex gap-2 mt-4">
//       {pagination.links?.map((link, index) => (
//         <button
//           key={index}
//           onClick={() => link.url && onPageChange(new URL(link.url).searchParams.get("page"))}
//           className={`px-3 py-1 border ${
//             link.active ? "bg-blue-600 text-white" : ""
//           }`}
//           dangerouslySetInnerHTML={{ __html: link.label }}
//         />
//       ))}
//     </div>
//   );
// };

// export default Pagination;


import React from "react";

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination?.last_page || pagination.last_page <= 1)
    return null;

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">

      <div className="text-sm text-gray-600">
        Showing {pagination.from} to {pagination.to} of{" "}
        {pagination.total} results
      </div>

      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          disabled={!pagination.prev_page_url}
          onClick={() =>
            onPageChange(pagination.current_page - 1)
          }
          className={`px-3 py-1 rounded-md text-sm ${
            pagination.prev_page_url
              ? "bg-white border hover:bg-gray-100"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {Array.from(
          { length: pagination.last_page },
          (_, i) => i + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md text-sm ${
              pagination.current_page === page
                ? "bg-blue-600 text-white"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={!pagination.next_page_url}
          onClick={() =>
            onPageChange(pagination.current_page + 1)
          }
          className={`px-3 py-1 rounded-md text-sm ${
            pagination.next_page_url
              ? "bg-white border hover:bg-gray-100"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>

      </div>
    </div>
  );
};

export default Pagination;