"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

// همان کلید اپ React Native
export const THEME_KEY = "theme-mode";

const ThemeContext = createContext(null);

function applyToDom(mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode; // اسکرول‌بار و المان‌های خود مرورگر هم هم‌رنگ می‌شوند

  // رنگ نوار بالای مرورگر موبایل
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  if (bg) meta.content = bg;
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("light");

  // مقدار اولیه را اسکریپت داخل layout روی <html> گذاشته؛ اینجا فقط همگام می‌کنیم
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    const saved = current === "dark" || current === "light" ? current : "light";
    setModeState(saved);
    applyToDom(saved);
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    try {
      localStorage.setItem(THEME_KEY, m);
    } catch {}
    applyToDom(m);
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
