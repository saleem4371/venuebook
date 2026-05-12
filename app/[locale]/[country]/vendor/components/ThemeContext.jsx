"use client";
import { createContext, useState, useContext, useEffect } from "react";

const STORAGE_KEY = "theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  /*
   * Initialize from localStorage so this provider is always in sync
   * with the global theme set by app/layout.jsx's inline script.
   * Default to "light" when nothing is stored.
   */
  const [theme, setTheme] = useState("light");

  /* Sync initial state from the global localStorage key on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    } catch (_) {}
  }, []);

  /* Keep <html> class and localStorage in sync on every change */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);