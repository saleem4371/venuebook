"use client";

import { createContext, useContext, useEffect, useState } from "react";

const GeoContext = createContext(null);

export function GeoProvider({ children }) {
  const [country, setCountry] = useState("in");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCountry = async () => {
      try {
        const cookieCountry = document.cookie
          .split("; ")
          .find((row) => row.startsWith("country="))
          ?.split("=")[1];

        if (cookieCountry) {
          setCountry(cookieCountry);
          setLoading(false);
          return;
        }

        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        setCountry(data.country_code?.toLowerCase() || "in");
      } catch {
        setCountry("in");
      } finally {
        setLoading(false);
      }
    };

    getCountry();
  }, []);

  return (
    <GeoContext.Provider value={{ country, setCountry, loading }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const context = useContext(GeoContext);

  if (!context) {
    throw new Error("useGeo must be used inside GeoProvider");
  }

  return context;
}