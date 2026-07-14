"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function SearchModal({ close }) {

const [type, setType] = useState("venue");
const [location, setLocation] = useState("");
const [guests, setGuests] = useState(1);

const venues = [
"Udupi Beach Resort",
"Mangalore Royal Hall",
"Bangalore Palace Venue",
"Goa Sunset Resort",
];

const filtered = venues.filter(v =>
v.toLowerCase().includes(location.toLowerCase())
);

return (

<div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50">

  <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">

    {/* HEADER */}
    <div className="flex justify-between mb-6">

      <div className="flex gap-4">

        <button
          onClick={() => setType("venue")}
          className={`px-4 py-2 rounded-full ${
            type === "venue" ? "bg-black text-white" : "border"
          }`}
        >
          Venue
        </button>

        <button
          onClick={() => setType("resort")}
          className={`px-4 py-2 rounded-full ${
            type === "resort" ? "bg-black text-white" : "border"
          }`}
        >
          Resort
        </button>

      </div>

      <button onClick={close}>
        <X />
      </button>

    </div>

    {/* LOCATION */}
    <div className="mb-4">

      <label className="text-sm font-medium">
        Search Location
      </label>

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border w-full p-2 rounded-lg mt-1"
        placeholder="Search city or venue"
      />

      {location && (
        <div className="border rounded-lg mt-2 bg-white">

          {filtered.map((v, i) => (
            <div
              key={i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => setLocation(v)}
            >
              {v}
            </div>
          ))}

        </div>
      )}

    </div>

    {/* DATE */}
    <div className="mb-4">

      <label className="text-sm font-medium">
        Date
      </label>

      <input
        type="date"
        className="border w-full p-2 rounded-lg mt-1"
      />

    </div>

    {/* GUEST */}
    <div className="mb-6">

      <label className="text-sm font-medium">
        Guests
      </label>

      <select
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        className="border w-full p-2 rounded-lg mt-1"
      >
        <option>1 Guest</option>
        <option>2 Guests</option>
        <option>5 Guests</option>
        <option>10 Guests</option>
      </select>

    </div>

    {/* SEARCH */}
    <button className="w-full bg-black text-white py-3 rounded-xl">
      Search
    </button>

  </div>

</div>
);
}
