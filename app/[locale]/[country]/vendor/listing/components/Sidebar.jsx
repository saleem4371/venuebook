export default function Sidebar({ steps, currentStep, setCurrentStep, form }) {
  const isCompleted = (step) => {
    if (step === "basic") return form.title.length > 3;
    if (step === "capacity") return form.capacity > 0;
    return true;
  };

  return (
    <div className="w-72 bg-white border-r p-5">
      <h2 className="text-xl font-semibold mb-6">Your Listing</h2>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const active = index === currentStep;

          return (
            <div
              key={step}
              onClick={() => setCurrentStep(index)}
              className={`p-3 rounded-xl cursor-pointer flex justify-between items-center
              ${active ? "bg-purple-100 text-purple-600" : "hover:bg-gray-100"}
              `}
            >
              <span className="capitalize">{step}</span>

              {isCompleted(step) && (
                <span className="text-green-500 text-sm">✔</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="h-2 bg-purple-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
