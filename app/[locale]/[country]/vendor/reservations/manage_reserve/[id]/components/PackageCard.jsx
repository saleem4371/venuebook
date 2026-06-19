export default function PackageCard({
  data,
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex justify-between mb-5">
        <h3 className="font-semibold">
          Package Details
        </h3>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
          Silver Buffet ₹696
        </span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(data).map(
          ([category, items]) => (
            <div key={category}>
              <div className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded mb-2">
                {category}
              </div>

              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}