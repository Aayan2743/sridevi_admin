export default function FilterPills({ items, active, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center min-w-[80px] px-2 py-3 rounded-2xl border transition
              ${
                isActive
                  ? "bg-green-50 border-green-600"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            {/* ICON */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {item.icon || item.name.charAt(0)}
            </div>

            {/* LABEL */}
            <span className="text-xs mt-1 font-medium truncate">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
