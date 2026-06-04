"use client";

/**
 * PropertyTypeModalContext
 *
 * Allows any page inside the vendor layout to open the Property Type
 * selection modal (Single vs Multi-Unit) without the modal being a
 * descendant of the animated PageMainWrapper (which applies CSS
 * transforms that trap position:fixed children).
 *
 * Usage:
 *   const { openPropertyModal } = usePropertyTypeModal();
 *   openPropertyModal({ accentFrom, accentTo, onContinue });
 */

import { createContext, useContext, useState, useCallback } from "react";

const PropertyTypeModalContext = createContext(null);

export function PropertyTypeModalProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    accentFrom: "#a44bf3",
    accentTo: "#499ce8",
    category: "venue",
    onContinue: null,
  });

  const openPropertyModal = useCallback(({ accentFrom, accentTo, category, onContinue }) => {
    setState({ open: true, accentFrom, accentTo, category: category ?? "venue", onContinue });
  }, []);

  const closePropertyModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <PropertyTypeModalContext.Provider
      value={{ state, openPropertyModal, closePropertyModal }}
    >
      {children}
    </PropertyTypeModalContext.Provider>
  );
}

export function usePropertyTypeModal() {
  const ctx = useContext(PropertyTypeModalContext);
  if (!ctx) {
    throw new Error(
      "usePropertyTypeModal must be used inside <PropertyTypeModalProvider>."
    );
  }
  return ctx;
}
