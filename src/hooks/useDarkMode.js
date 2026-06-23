import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("caremate-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("caremate-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("caremate-theme", "light");
    }
  }, [dark]);

  return { dark, toggle: () => setDark((v) => !v) };
}
