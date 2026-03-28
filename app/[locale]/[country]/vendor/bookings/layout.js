"use client";

import TopBar from "./components/TopBar";

export default function BookingLayout({ children }) {
  return (
    <div className="">

      <TopBar />

      <div className="max-w-7xl mx-auto py-6">
        {children}
      </div>

    </div>
  );
}