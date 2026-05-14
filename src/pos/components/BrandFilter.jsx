export default function BrandFilter({ items, active, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              w-20 h-20
              flex flex-col items-center justify-center
              rounded-xl border transition
              ${
                isActive
                  ? "bg-green-50 border-green-600"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }
            `}
          >
            {/* ICON */}
            <div
              className={`
                w-10 h-10 rounded-full
                flex items-center justify-center
                ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {item.icon || item.name.charAt(0)}
            </div>

            {/* LABEL */}
            <span className="text-[11px] font-medium mt-1">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
