"use client";

import { useState } from "react";

export default function EventTypes() {
  const [selected, setSelected] = useState([]);

  const events = [
    "Mehandi", "Engagement", "Roce", "Wedding", "Anniversary",
    "Trade or consumer show", "Shareholders meeting",
    "Conference or convention", "Tour group or vacation",
    "Reception", "Team building event", "Sports event",
    "Bachelor or bachelorette party", "Reunion",
    "Education or seminar", "Corporate event", "Other",
    "Fundraiser or charity event", "Training", "Business meeting",
    "Sangeeth", "Concert", "Birthday", "Communion",
    "Special event", "Baby Shower", "Holiday party"
  ];

  const toggleEvent = (event) => {
    setSelected((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Event Types</h2>

      <div className="flex flex-wrap gap-3">
        {events.map((event) => {
          const isActive = selected.includes(event);

          return (
            <button
              key={event}
              onClick={() => toggleEvent(event)}
              className={`px-4 py-2 rounded-full text-sm border transition-all
                ${
                  isActive
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              {event}
            </button>
          );
        })}
      </div>
    </div>
  );
}
