"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useModal } from "@/context/ModalContext";

const UIContext = createContext();

export function UIProvider({ children }) {
  const { requestModal, releaseModal, canShow } = useModal();
  const [loginRequested,     setLoginRequested]     = useState(false);
  const [filterOpen,         setFilterOpen]         = useState(false);
  const [showMap,            setShowMap]            = useState(false);
  const [showReels,          setShowReels]          = useState(false);
  const [compareOpen,        setCompareOpen]        = useState(false);
  const [categorySheetOpen,  setCategorySheetOpen]  = useState(false);
  const [pwaLogin,           setPwaLogin]           = useState(false);
  const [hideSiteChrome,     setHideSiteChrome]     = useState(false);

  const setLoginOpen = useCallback((open) => {
    if (open) {
      setLoginRequested(true);
      requestModal("auth");
    } else {
      setLoginRequested(false);
      releaseModal("auth");
    }
  }, [requestModal, releaseModal]);

  const loginOpen = loginRequested && canShow("auth");

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
        pwaLogin,
        setPwaLogin,
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
