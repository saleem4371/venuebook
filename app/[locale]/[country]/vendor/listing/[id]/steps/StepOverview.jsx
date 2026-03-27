import { isStepCompleted } from "./stepsConfig";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";


export default function StepOverview({
  steps,
  form,
  progress,
  onSelect,
}) {
  const allCompleted = progress === 100;
const router = useRouter();
  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between mb-8">

         <div className="flex items-center gap-4">
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
    >
      <ArrowLeft size={18} />
      Back
    </button>

    <h1 className="text-2xl font-semibold">
      Create your listing
    </h1>
  </div>

        {/* 🔥 PREMIUM PROGRESS RING */}
        <div className="relative w-16 h-16">

          <svg className="w-full h-full rotate-[-90deg]">
            {/* background */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />

            {/* progress */}
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={allCompleted ? "#22c55e" : "#ef4444"} // 🔥 green or red
              strokeWidth="6"
              fill="none"
              strokeDasharray={175}
              strokeDashoffset={175 - (progress / 100) * 175}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          {/* % */}
          <span
            className={`absolute inset-0 flex items-center justify-center text-sm font-semibold
            ${allCompleted ? "text-green-600" : "text-red-500"}`}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* 🔥 STEP GRID */}
      <div className="grid sm:grid-cols-2 gap-5">
        {steps.map((step) => {
          const completed = isStepCompleted(step.key, form);

          return (
            <div
              key={step.key}
              onClick={() => onSelect(step.key)}
              className={`p-5 rounded-2xl cursor-pointer
              backdrop-blur-xl border transition-all duration-300
              hover:scale-[1.02] hover:shadow-xl

              ${
                completed
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
              `}
            >
              <div className="flex justify-between items-center">

                {/* TITLE */}
                <h2 className="font-semibold flex items-center gap-2">
                  {step.title}

                  {!step.required && (
                    <span className="text-xs text-gray-400">
                      Optional
                    </span>
                  )}
                </h2>

                {/* STATUS ICON */}
                <span
                  className={`text-sm font-semibold
                  ${
                    completed
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {completed ? "✔ Done" : "✕ Required"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
