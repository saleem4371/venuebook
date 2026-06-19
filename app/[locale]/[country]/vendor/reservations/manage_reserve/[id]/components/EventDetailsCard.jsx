import {
  CalendarDays,
} from "lucide-react";

export default function EventDetailsCard({
  data,
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex justify-between mb-6">
        <h3 className="font-semibold text-lg">
          Event Details
        </h3>

        <span className="bg-violet-100 text-violet-600 px-3 py-1 rounded-lg text-xs">
          Single
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-4">
        {Object.entries(data).map(
          ([key, value]) => (
            <>
              <div className="text-slate-500 capitalize">
                {key}
              </div>

              <div>{value}</div>
            </>
          )
        )}
      </div>

      <CalendarDays
        className="absolute opacity-10"
        size={90}
      />
    </div>
  );
}