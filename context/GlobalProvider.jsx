"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  getEvents,
  getProperty,
  LoadAllCategory,
  getCountry,
} from "@/services/global.service";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const [properties, setProperties] = useState([]);
  const [categorys, setCategory] = useState([]);
  const [country, setCountry] = useState([]);

  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD ONLY ONE TIME
  // ============================================

  useEffect(() => {
    loadGlobal();
  }, []);

  const loadGlobal = async () => {
    try {
      const [eventRes, propertyRes,CategoryRes,countryRes] = await Promise.all([
        getEvents(),
        getProperty(1),
        LoadAllCategory(),
        getCountry(),
      ]);

      setEvents(eventRes.data);

      setProperties(propertyRes.data.data);

      setCategory(CategoryRes.data);
      setCountry(countryRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        events,
        properties,
        country,
        loading,
        categorys,
        refreshGlobal: loadGlobal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useGlobal = () => useContext(GlobalContext);
