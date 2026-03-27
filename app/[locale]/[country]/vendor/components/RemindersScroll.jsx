// RemindersVertical.jsx
"use client";

import { useEffect } from "react";

export default function RemindersVertical({ reminders }) {
  useEffect(() => {
    const audio = new Audio("/reminder-sound.mp3"); // Add your sound file in public folder

    const interval = setInterval(() => {
      // Play sound every 1 min
      if (reminders.length > 0) {
        audio.play().catch(() => console.log("Audio play failed"));
      }
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Reminders</h2>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {reminders.map((reminder, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4 animate-fade-in"
          >
            {/* Icon */}
            <div className="flex-shrink-0 bg-purple-100 text-purple-600 p-3 rounded-full animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800">
                {reminder.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Don’t forget your event scheduled for{" "}
                <span className="font-semibold">
                  {reminder.date} at {reminder.time}
                </span>
                .
              </p>
            </div>

            {/* Bell Icon */}
            <div className="flex-shrink-0 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}