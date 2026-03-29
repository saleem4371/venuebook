"use client";

import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function VendorUIProvider({ children }) {
  const [showDock, setShowDock] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // ✅ FINAL LOGIC
  const hideBottomMenu = !showDock || isModalOpen || isFabOpen;

  return (
    <UIContext.Provider
      value={{
        showDock,
        setShowDock,
        isModalOpen,
        setIsModalOpen,
        isFabOpen,
        setIsFabOpen,
        hideBottomMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

// ✅ SAFE HOOK (prevents crash)
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used inside VendorUIProvider");
  }
  return context;
};