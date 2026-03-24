"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function MobileSearchTrigger({ setOpenSearch }) {
  return (
    <div className="md:hidden mt-8">
      <button
        onClick={() => setOpenSearch(true)}
        className="w-full bg-white text-gray-500 rounded-xl p-4 flex justify-between items-center shadow-lg active:scale-95 transition"
      >
        Search location, date, guests
        <MagnifyingGlassIcon className="w-5" />
      </button>
    </div>
  );
}
