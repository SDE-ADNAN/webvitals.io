"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectThemeMode } from "@/lib/redux/slices/themeSlice";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector(selectThemeMode);

  useEffect(() => {
    // Apply theme class to html element
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeMode]);

  return <>{children}</>;
}
