export default function ActivityTimeline({
  activities,
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-semibold mb-5">
        Activity Timeline
      </h3>

      <div className="space-y-5">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex gap-4"
          >
            <div className="w-3 h-3 rounded-full bg-violet-600 mt-2" />

            <div>
              <h4 className="font-medium">
                {item.title}
              </h4>

              <p className="text-sm text-slate-500">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}