// "use client";

// import { createContext, useContext, useState } from "react";

// const UIContext = createContext();

// export function UIProvider({ children }) {
//   const [showMap, setShowMap] = useState(false);
//   const [filterOpen, setFilterOpen] = useState(false);

//   // ✅ AUTO HIDE LOGIC
//   const hideBottomMenu = showMap || filterOpen;

//   return (
//     <UIContext.Provider
//       value={{
//         showMap,
//         setShowMap,
//         filterOpen,
//         setFilterOpen,
//         hideBottomMenu, // ✅ expose
//       }}
//     >
//       {children}
//     </UIContext.Provider>
//   );
// }

// export const useUI = () => useContext(UIContext);

"use client";

import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
//   const [hideBottomMenu, setHideBottomMenu] = useState(false);

   const hideBottomMenu = showMap || filterOpen || compareOpen;

  return (
    <UIContext.Provider
      value={{
        loginOpen,
        setLoginOpen,
        filterOpen,
        setFilterOpen,
        showMap,
        setShowMap,
         compareOpen,
        setCompareOpen,
       
        hideBottomMenu
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);