"use client";

import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleTheme, selectThemeMode } from "@/lib/redux/slices/themeSlice";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
      type="button"
    >
      {themeMode === "light" ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
