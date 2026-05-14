const steps = ["Basic", "Gallery", "Variation", "SEO", "Tax"];

export default function WizardHeader({ currentStep, onStepChange }) {
  return (
    <div className="border-b bg-white">
      <div className="px-6">
        <nav className="flex gap-8">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            const isDisabled = currentStep < index;

            return (
              <button
                key={step}
                onClick={() => !isDisabled && onStepChange(index)}
                disabled={isDisabled}
                className={`
                  relative py-4 text-sm font-medium transition
                  ${
                    isActive
                      ? "text-indigo-600"
                      : isCompleted
                      ? "text-gray-700 hover:text-indigo-600"
                      : "text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {step}

                {/* ACTIVE UNDERLINE */}
                {isActive && (
                  <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
