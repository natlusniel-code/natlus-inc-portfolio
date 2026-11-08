import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children, defaultDark = false }: { children: ReactNode; defaultDark?: boolean }) {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("natlus-theme");
      if (saved === "dark" || saved === "light") return saved === "dark";
      return defaultDark;
    } catch {
      return defaultDark;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    // Keep exactly one of the two classes: index.html ships `light`, and
    // leaving it in place alongside `dark` would make both apply.
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
    try {
      localStorage.setItem("natlus-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = () => setDark((d) => !d);
  const value = useMemo(() => ({ dark, toggle }), [dark]);
  // createElement keeps this module a plain .ts file (no JSX).
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
