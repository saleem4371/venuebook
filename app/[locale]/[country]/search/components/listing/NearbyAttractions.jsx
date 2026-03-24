import { Star } from "lucide-react";

export default function NearbyAttractions() {
  const places = [
    {
      name: "SunSet Point",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      rating: 4.6,
    },
    {
      name: "Phalguni Dam",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      rating: 4.3,
    },
    {
      name: "Sangottu Dam",
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
      rating: 4.0,
    },
  ];

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">
        Near By Attractions Places
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {places.map((place) => (
          <div
            key={place.name}
            className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition"
          >
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-3">
              <h3 className="font-medium text-sm mb-1">
                {place.name}
              </h3>

              {/* ⭐ Rating */}
              <div className="flex items-center gap-1 text-purple-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={
                      i < Math.floor(place.rating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
                <span className="text-gray-600 text-xs ml-1">
                  ({place.rating})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
