/**
 * Unit tests for UI slice
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from "vitest";
import uiReducer, {
  toggleSidebar,
  toggleMobileMenu,
  openModal,
  closeModal,
  selectSidebarOpen,
  selectMobileMenuOpen,
  selectActiveModal,
} from "./uiSlice";

describe("uiSlice", () => {
  const initialState = {
    sidebarOpen: true,
    mobileMenuOpen: false,
    activeModal: null,
  };

  describe("reducer", () => {
    it("should return the initial state", () => {
      expect(uiReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("toggleSidebar action", () => {
    it("should toggle sidebar from open to closed", () => {
      const state = { ...initialState, sidebarOpen: true };
      const newState = uiReducer(state, toggleSidebar());
      expect(newState.sidebarOpen).toBe(false);
    });

    it("should toggle sidebar from closed to open", () => {
      const state = { ...initialState, sidebarOpen: false };
      const newState = uiReducer(state, toggleSidebar());
      expect(newState.sidebarOpen).toBe(true);
    });

    it("should toggle back and forth correctly", () => {
      let state = { ...initialState, sidebarOpen: true, activeModal: null as string | null };
      state = uiReducer(state, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);
      state = uiReducer(state, toggleSidebar());
      expect(state.sidebarOpen).toBe(true);
    });

    it("should not affect other UI state", () => {
      const state = {
        sidebarOpen: true,
        mobileMenuOpen: true,
        activeModal: "test-modal",
      };
      const newState = uiReducer(state, toggleSidebar());
      expect(newState.mobileMenuOpen).toBe(true);
      expect(newState.activeModal).toBe("test-modal");
    });
  });

  describe("toggleMobileMenu action", () => {
    it("should toggle mobile menu from closed to open", () => {
      const state = { ...initialState, mobileMenuOpen: false };
      const newState = uiReducer(state, toggleMobileMenu());
      expect(newState.mobileMenuOpen).toBe(true);
    });

    it("should toggle mobile menu from open to closed", () => {
      const state = { ...initialState, mobileMenuOpen: true };
      const newState = uiReducer(state, toggleMobileMenu());
      expect(newState.mobileMenuOpen).toBe(false);
    });

    it("should toggle back and forth correctly", () => {
      let state = { ...initialState, mobileMenuOpen: false, activeModal: null as string | null };
      state = uiReducer(state, toggleMobileMenu());
      expect(state.mobileMenuOpen).toBe(true);
      state = uiReducer(state, toggleMobileMenu());
      expect(state.mobileMenuOpen).toBe(false);
    });

    it("should not affect other UI state", () => {
      const state = {
        sidebarOpen: false,
        mobileMenuOpen: false,
        activeModal: "test-modal",
      };
      const newState = uiReducer(state, toggleMobileMenu());
      expect(newState.sidebarOpen).toBe(false);
      expect(newState.activeModal).toBe("test-modal");
    });
  });

  describe("openModal action", () => {
    it("should open a modal by setting activeModal", () => {
      const newState = uiReducer(initialState, openModal("add-site"));
      expect(newState.activeModal).toBe("add-site");
    });

    it("should replace currently active modal", () => {
      const state = { ...initialState, activeModal: "old-modal" };
      const newState = uiReducer(state, openModal("new-modal"));
      expect(newState.activeModal).toBe("new-modal");
    });

    it("should not affect other UI state", () => {
      const state = {
        sidebarOpen: false,
        mobileMenuOpen: true,
        activeModal: null,
      };
      const newState = uiReducer(state, openModal("test-modal"));
      expect(newState.sidebarOpen).toBe(false);
      expect(newState.mobileMenuOpen).toBe(true);
    });
  });

  describe("closeModal action", () => {
    it("should close modal by setting activeModal to null", () => {
      const state = { ...initialState, activeModal: "test-modal" };
      const newState = uiReducer(state, closeModal());
      expect(newState.activeModal).toBeNull();
    });

    it("should work when no modal is open", () => {
      const newState = uiReducer(initialState, closeModal());
      expect(newState.activeModal).toBeNull();
    });

    it("should not affect other UI state", () => {
      const state = {
        sidebarOpen: false,
        mobileMenuOpen: true,
        activeModal: "test-modal",
      };
      const newState = uiReducer(state, closeModal());
      expect(newState.sidebarOpen).toBe(false);
      expect(newState.mobileMenuOpen).toBe(true);
    });
  });

  describe("selectors", () => {
    const mockState = {
      theme: { mode: "light" as const, _persist: { version: -1, rehydrated: true } },
      user: { user: null, token: null, isAuthenticated: false, isLoading: false, _persist: { version: -1, rehydrated: true } },
      ui: {
        sidebarOpen: false,
        mobileMenuOpen: true,
        activeModal: "test-modal" as string | null,
      },
    };

    describe("selectSidebarOpen", () => {
      it("should select sidebar open state", () => {
        expect(selectSidebarOpen(mockState as any)).toBe(false);
      });

      it("should return true when sidebar is open", () => {
        const state = {
          ...mockState,
          ui: { ...mockState.ui, sidebarOpen: true },
        };
        expect(selectSidebarOpen(state as any)).toBe(true);
      });
    });

    describe("selectMobileMenuOpen", () => {
      it("should select mobile menu open state", () => {
        expect(selectMobileMenuOpen(mockState as any)).toBe(true);
      });

      it("should return false when mobile menu is closed", () => {
        const state = {
          ...mockState,
          ui: { ...mockState.ui, mobileMenuOpen: false },
        };
        expect(selectMobileMenuOpen(state as any)).toBe(false);
      });
    });

    describe("selectActiveModal", () => {
      it("should select active modal", () => {
        expect(selectActiveModal(mockState as any)).toBe("test-modal");
      });

      it("should return null when no modal is active", () => {
        const state = {
          ...mockState,
          ui: { ...mockState.ui, activeModal: null },
        };
        expect(selectActiveModal(state as any)).toBeNull();
      });
    });
  });
});
