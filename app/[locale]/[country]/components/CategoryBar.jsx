"use client";

/**
 * CategoryBar — horizontal scrollable pill chips.
 *
 * "All" chip first → deselects any active category.
 * Active chip uses VenueBook brand gradient.
 * Dark mode aware. Mobile swipe friendly.
 */

const GRADIENT = "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)";

export default function CategoryBar({
  selectedCategory,
  setSelectedCategory,
  loadData = [],
}) {
  const toggle = (id) =>
    setSelectedCategory(selectedCategory === id ? null : id);

  const chipCls = (active) =>
    "flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-sm font-medium " +
    "border transition-all duration-200 whitespace-nowrap cursor-pointer select-none " +
    (active
      ? "text-white border-transparent shadow-sm"
      : "text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 " +
        "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500");

  return (
    <div className="w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div
        className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* ALL chip */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={chipCls(selectedCategory === null)}
          style={selectedCategory === null ? { background: GRADIENT } : {}}
        >
          All
        </button>

        {/* Dynamic chips */}
        {loadData.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={chipCls(active)}
              style={active ? { background: GRADIENT } : {}}
            >
              
              {cat.icon && (
                <img
                  src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/${cat.icon}`}
                  alt=""
                  className={
                    "w-3.5 h-3.5 object-contain flex-shrink-0 " +
                    (active ? "brightness-0 invert" : "opacity-60")
                  }
                />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
