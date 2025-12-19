/**
 * Unit tests for theme slice
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";
import themeReducer, { toggleTheme, setTheme, selectThemeMode } from "./themeSlice";

describe("themeSlice", () => {
  const initialState = {
    mode: "light" as const,
  };

  describe("reducer", () => {
    it("should return the initial state", () => {
      expect(themeReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("toggleTheme action", () => {
    it("should toggle from light to dark", () => {
      const state = { mode: "light" as const };
      const newState = themeReducer(state, toggleTheme());
      expect(newState.mode).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      const state = { mode: "dark" as const };
      const newState = themeReducer(state, toggleTheme());
      expect(newState.mode).toBe("light");
    });

    it("should toggle back and forth correctly", () => {
      let state = { mode: "light" as "light" | "dark" };
      state = themeReducer(state, toggleTheme());
      expect(state.mode).toBe("dark");
      state = themeReducer(state, toggleTheme());
      expect(state.mode).toBe("light");
    });
  });

  describe("setTheme action", () => {
    it("should set theme to light", () => {
      const state = { mode: "dark" as const };
      const newState = themeReducer(state, setTheme("light"));
      expect(newState.mode).toBe("light");
    });

    it("should set theme to dark", () => {
      const state = { mode: "light" as const };
      const newState = themeReducer(state, setTheme("dark"));
      expect(newState.mode).toBe("dark");
    });

    it("should set theme even if already set to that value", () => {
      const state = { mode: "light" as const };
      const newState = themeReducer(state, setTheme("light"));
      expect(newState.mode).toBe("light");
    });
  });

  describe("selectThemeMode selector", () => {
    it("should select the theme mode", () => {
      const state = {
        theme: { mode: "dark" as const, _persist: { version: -1, rehydrated: true } },
        user: { user: null, token: null, isAuthenticated: false, isLoading: false, _persist: { version: -1, rehydrated: true } },
        ui: { sidebarOpen: true, mobileMenuOpen: false, activeModal: null },
      };
      expect(selectThemeMode(state as any)).toBe("dark");
    });

    it("should select light mode", () => {
      const state = {
        theme: { mode: "light" as const, _persist: { version: -1, rehydrated: true } },
        user: { user: null, token: null, isAuthenticated: false, isLoading: false, _persist: { version: -1, rehydrated: true } },
        ui: { sidebarOpen: true, mobileMenuOpen: false, activeModal: null },
      };
      expect(selectThemeMode(state as any)).toBe("light");
    });
  });
});
