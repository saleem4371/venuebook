"use client";

import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [loginOpen,          setLoginOpen]          = useState(false);
  const [filterOpen,         setFilterOpen]         = useState(false);
  const [showMap,            setShowMap]            = useState(false);
  const [showReels,          setShowReels]          = useState(false);
  const [compareOpen,        setCompareOpen]        = useState(false);
  const [categorySheetOpen,  setCategorySheetOpen]  = useState(false);

  const hideBottomMenu = showMap || showReels || filterOpen || compareOpen;

  return (
    <UIContext.Provider
      value={{
        loginOpen,
        setLoginOpen,
        filterOpen,
        setFilterOpen,
        showMap,
        setShowMap,
        showReels,
        setShowReels,
        compareOpen,
        setCompareOpen,
        categorySheetOpen,
        setCategorySheetOpen,
        hideBottomMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
