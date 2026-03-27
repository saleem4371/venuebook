// ResponsiveSummaryCards.jsx
"use client";

export default function ResponsiveSummaryCards({ data }) {
  return (
    <div className="p-0 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Online and Offline Summary
        </h2>
        <button className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15a5 5 0 100-10 5 5 0 000 10z" />
            <path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
          >
            <div className="text-sm font-medium text-gray-500">{row.category}</div>
            <div className="mt-2 flex justify-between text-gray-700">
              <div className="flex flex-col items-center">
                <span className="text-xs">Offline</span>
                <span className="font-semibold">{row.offline}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs">Online</span>
                <span className="font-semibold">{row.online}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs">Total</span>
                <span className="font-semibold">{row.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}