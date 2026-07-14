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

  /* Set by a page (e.g. Messages full-screen thread on mobile) to hide the
     site Navbar + BottomMenu without touching their own internals. Always
     reset back to false by the caller on unmount / condition change. */
  const [hideSiteChrome,     setHideSiteChrome]     = useState(false);

  const hideBottomMenu = showMap || showReels || filterOpen || compareOpen || hideSiteChrome;

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
        hideSiteChrome,
        setHideSiteChrome,
        hideBottomMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
