export default function BookingTimeline() {
  const steps = [
    "Booked",
    "Reminder Sent",
    "Event Date",
    "Closed",
  ];

  return (
    <div className="bg-white border rounded-2xl p-8">
      <div className="flex justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200" />

        <div className="absolute top-4 left-0 w-[75%] h-1 bg-violet-500" />

        {steps.map((step, i) => (
          <div
            key={step}
            className="relative z-10 flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center
              ${
                i < 3
                  ? "bg-violet-600 text-white"
                  : "bg-slate-200"
              }`}
            >
              ✓
            </div>

            <p className="text-sm mt-3 font-medium">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}