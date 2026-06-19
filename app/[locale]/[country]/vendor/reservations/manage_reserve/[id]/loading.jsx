export default function Loading() {
  return (
    <div className="p-6 space-y-5 animate-pulse bg-gray-50 min-h-screen">

      {/* Header skeleton */}
      <div className="h-20 bg-gray-200 rounded-xl" />

      {/* Timeline skeleton */}
      <div className="h-16 bg-gray-200 rounded-xl" />

      {/* Tabs skeleton */}
      <div className="h-12 bg-gray-200 rounded-xl w-1/2" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">

          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-60 bg-gray-200 rounded-xl" />

        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />

        </div>
      </div>
    </div>
  );
}