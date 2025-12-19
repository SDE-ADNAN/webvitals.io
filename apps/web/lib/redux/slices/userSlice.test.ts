/**
 * Unit tests for user slice
 */

import { describe, it, expect } from "vitest";
import userReducer, {
  setUser,
  setToken,
  logout,
  setLoading,
  selectUser,
  selectIsAuthenticated,
} from "./userSlice";
import type { User } from "@webvitals/types";

describe("userSlice", () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  };

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    createdAt: "2025-12-18T00:00:00Z",
  };

  describe("reducer", () => {
    it("should return the initial state", () => {
      expect(userReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });
  });

  describe("setUser action", () => {
    it("should set the user and mark as authenticated", () => {
      const newState = userReducer(initialState, setUser(mockUser));
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it("should update user if already set", () => {
      const state = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };
      const updatedUser = { ...mockUser, firstName: "Updated" };
      const newState = userReducer(state, setUser(updatedUser));
      expect(newState.user?.firstName).toBe("Updated");
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe("setToken action", () => {
    it("should set the token and mark as authenticated", () => {
      const token = "test-token-123";
      const newState = userReducer(initialState, setToken(token));
      expect(newState.token).toBe(token);
      expect(newState.isAuthenticated).toBe(true);
    });

    it("should update token if already set", () => {
      const state = {
        ...initialState,
        token: "old-token",
        isAuthenticated: true,
      };
      const newToken = "new-token-456";
      const newState = userReducer(state, setToken(newToken));
      expect(newState.token).toBe(newToken);
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe("logout action", () => {
    it("should clear user, token, and authentication state", () => {
      const state = {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        isLoading: false,
      };
      const newState = userReducer(state, logout());
      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.isLoading).toBe(false);
    });

    it("should clear loading state on logout", () => {
      const state = {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        isLoading: true,
      };
      const newState = userReducer(state, logout());
      expect(newState.isLoading).toBe(false);
    });

    it("should work when already logged out", () => {
      const newState = userReducer(initialState, logout());
      expect(newState).toEqual(initialState);
    });
  });

  describe("setLoading action", () => {
    it("should set loading to true", () => {
      const newState = userReducer(initialState, setLoading(true));
      expect(newState.isLoading).toBe(true);
    });

    it("should set loading to false", () => {
      const state = { ...initialState, isLoading: true };
      const newState = userReducer(state, setLoading(false));
      expect(newState.isLoading).toBe(false);
    });

    it("should not affect other state properties", () => {
      const state = {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        isLoading: false,
      };
      const newState = userReducer(state, setLoading(true));
      expect(newState.user).toEqual(mockUser);
      expect(newState.token).toBe("test-token");
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.isLoading).toBe(true);
    });
  });

  describe("selectors", () => {
    const mockState = {
      theme: { mode: "light" as const },
      user: {
        user: mockUser,
        token: "test-token",
        isAuthenticated: true,
        isLoading: false,
      },
      ui: { sidebarOpen: true, mobileMenuOpen: false, activeModal: null },
    };

    describe("selectUser", () => {
      it("should select the user", () => {
        expect(selectUser(mockState)).toEqual(mockUser);
      });

      it("should return null when no user", () => {
        const state = {
          ...mockState,
          user: { ...mockState.user, user: null },
        };
        expect(selectUser(state)).toBeNull();
      });
    });

    describe("selectIsAuthenticated", () => {
      it("should select authentication status", () => {
        expect(selectIsAuthenticated(mockState)).toBe(true);
      });

      it("should return false when not authenticated", () => {
        const state = {
          ...mockState,
          user: { ...mockState.user, isAuthenticated: false },
        };
        expect(selectIsAuthenticated(state)).toBe(false);
      });
    });
  });
});
