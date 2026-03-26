"use client";

import { createContext, useContext, useState } from "react";

const DropdownContext = createContext();

export function DropdownProvider({ children }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const closeAll = () => setOpenDropdown(null);

  return (
    <DropdownContext.Provider
      value={{ openDropdown, toggleDropdown, closeAll }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

export const useDropdown = () => useContext(DropdownContext);