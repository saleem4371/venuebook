"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultCities = [
  { name: "Bengaluru", desc: "Premium luxury weddings with elite venues." },
  { name: "Mysuru", desc: "Royal palace-style heritage weddings." },
  { name: "Mangaluru", desc: "Coastal wedding venues with scenic charm." },
  { name: "Hubballi", desc: "Grand community wedding celebrations." },
];

export default function LocationAutoComplete() {
  const inputRef = useRef(null);
  const [show, setShow] = useState(false);
  const [places, setPlaces] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!window.google) return;

    const autocompleteService =
      new window.google.maps.places.AutocompleteService();

    if (value.length > 0) {
      autocompleteService.getPlacePredictions(
        { input: value },
        (predictions) => {
          setPlaces(predictions || []);
        }
      );
    } else {
      setPlaces([]);
    }
  }, [value]);

  return (
    <div className="relative w-full">
      {/* INPUT */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setShow(true)}
        placeholder="Search Locations"
        className="bg-transparent outline-none text-white w-full"
      />

      {/* DROPDOWN */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute left-0 mt-3 w-full bg-white rounded-2xl shadow-2xl p-3 z-50"
          >
            {/* DEFAULT */}
            {value.length === 0 &&
              defaultCities.map((city, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="bg-purple-100 p-2 rounded-lg">
                    📍
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {city.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {city.desc}
                    </p>
                  </div>
                </div>
              ))}

            {/* GOOGLE RESULTS */}
            {value.length > 0 &&
              places.map((place) => (
                <div
                  key={place.place_id}
                  className="p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => {
                    setValue(place.description);
                    setShow(false);
                  }}
                >
                  <p className="text-sm text-gray-800">
                    {place.description}
                  </p>
                </div>
              ))}

            {/* EMPTY */}
            {value.length > 0 && places.length === 0 && (
              <p className="text-center text-gray-400 py-3">
                No results found
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
