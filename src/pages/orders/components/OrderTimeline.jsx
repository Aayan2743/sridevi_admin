import {
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
} from "lucide-react";

const STEPS = [
  { key: "Pending", icon: Clock },
  { key: "Confirmed", icon: CheckCircle },
  { key: "Shipped", icon: Truck },
  { key: "Delivered", icon: PackageCheck },
];

export default function OrderTimeline({
  status,
  onChange, // 👈 callback
}) {
  const currentIndex = STEPS.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        Order Status
      </h3>

      <div className="flex gap-2 flex-wrap">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isClickable = index === currentIndex + 1;

          return (
            <button
              key={step.key}
              disabled={!isClickable}
              onClick={() => isClickable && onChange(step.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${
                  isCompleted
                    ? "bg-green-100 text-green-700 border-green-200 cursor-default"
                    : isActive
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm cursor-default"
                    : isClickable
                    ? "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-300"
                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                }
              `}
            >
              <Icon size={14} />
              {step.key}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        Click the next step to update order status
      </p>
    </div>
  );
}
