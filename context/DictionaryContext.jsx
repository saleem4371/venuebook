"use client";

import { createContext, useContext } from "react";

const DictionaryContext = createContext(null);

export function DictionaryProvider({ children, dict }) {
  return (
    <DictionaryContext.Provider value={dict}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);

  if (!context) {
    throw new Error("useDictionary must be used inside DictionaryProvider");
  }

  return context;
}
