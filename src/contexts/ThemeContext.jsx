// ThemeContext.jsx
// This file defines the ThemeContext and ThemeProvider for managing light/dark theme state across the app.
// It provides a context and hook for toggling and accessing the current theme.
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    // Add transition class temporarily to prevent flickering
    root.style.transition = "none";

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Force a reflow to ensure the class change is applied
    root.offsetHeight;

    // Re-enable transitions after a brief delay
    setTimeout(() => {
      root.style.transition = "";
    }, 10);
  }, [dark]);

  const toggleTheme = () => {
    setDark((d) => !d);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
