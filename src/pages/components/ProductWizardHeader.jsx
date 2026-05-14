const STEPS = [
  { label: "Basic" },
  { label: "Gallery" },
  { label: "Variation" },
  { label: "SEO" },
  { label: "Tax" },
];

export default function ProductWizardHeader({ title, step, setStep, onClose }) {
  const progress = (step / STEPS.length) * 100;

  return (
    <div className="bg-white border-b">
      {/* TOP ROW */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            Step {step} of {STEPS.length}
          </p>
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center
          rounded-full hover:bg-gray-100 text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* HORIZONTAL STEPS */}
      <div className="px-8 pb-4">
        <div className="flex items-center gap-6">
          {STEPS.map((item, index) => {
            const tabStep = index + 1;
            const isActive = step === tabStep;
            const isCompleted = step > tabStep;

            return (
              <button
                key={item.label}
                onClick={() => !isCompleted && setStep(tabStep)}
                disabled={isCompleted}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow"
                      : isCompleted
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-4 h-[3px] w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out
            bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
