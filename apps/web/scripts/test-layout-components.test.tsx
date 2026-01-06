/**
 * Test script for Layout Components (Task 6)
 * Tests: ThemeToggle, Sidebar, Header, MobileNav, MainLayout
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../lib/redux/slices/themeSlice";
import userReducer from "../lib/redux/slices/userSlice";
import uiReducer from "../lib/redux/slices/uiSlice";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Create a test store
function createTestStore(initialState = {}) {
  return configureStore({
    reducer: {
      theme: themeReducer,
      user: userReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
}

describe("Layout Components - Task 6", () => {
  describe("ThemeToggle Component", () => {
    it("should render theme toggle button", async () => {
      const { ThemeToggle } = await import(
        "../app/components/Theme/ThemeToggle"
      );
      const store = createTestStore();

      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDefined();
      expect(button.getAttribute("aria-label")).toContain("mode");
    });

    it("should display moon icon in light mode", async () => {
      const { ThemeToggle } = await import(
        "../app/components/Theme/ThemeToggle"
      );
      const store = createTestStore({
        theme: { mode: "light" },
      });

      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-label")).toContain("dark mode");
    });

    it("should display sun icon in dark mode", async () => {
      const { ThemeToggle } = await import(
        "../app/components/Theme/ThemeToggle"
      );
      const store = createTestStore({
        theme: { mode: "dark" },
      });

      render(
        <Provider store={store}>
          <ThemeToggle />
        </Provider>
      );

      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-label")).toContain("light mode");
    });
  });

  describe("Sidebar Component", () => {
    it("should render navigation links", async () => {
      const { Sidebar } = await import("../app/components/Layout/Sidebar");
      const store = createTestStore({
        user: {
          user: { email: "test@example.com" },
          isAuthenticated: true,
        },
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Sites")).toBeDefined();
      expect(screen.getByText("Alerts")).toBeDefined();
      expect(screen.getByText("Settings")).toBeDefined();
    });

    it("should display user information", async () => {
      const { Sidebar } = await import("../app/components/Layout/Sidebar");
      const store = createTestStore({
        user: {
          user: {
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
          },
          isAuthenticated: true,
        },
      });

      render(
        <Provider store={store}>
          <Sidebar />
        </Provider>
      );

      expect(screen.getByText("John Doe")).toBeDefined();
      expect(screen.getByText("test@example.com")).toBeDefined();
    });
  });

  describe("Header Component", () => {
    it("should render header with title", async () => {
      const { Header } = await import("../app/components/Layout/Header");
      const store = createTestStore();

      render(
        <Provider store={store}>
          <Header title="Test Page" />
        </Provider>
      );

      expect(screen.getByText("Test Page")).toBeDefined();
    });

    it("should render mobile menu button", async () => {
      const { Header } = await import("../app/components/Layout/Header");
      const store = createTestStore();

      render(
        <Provider store={store}>
          <Header />
        </Provider>
      );

      const mobileMenuButton = screen.getByLabelText("Toggle mobile menu");
      expect(mobileMenuButton).toBeDefined();
    });
  });

  describe("MobileNav Component", () => {
    it("should not render when closed", async () => {
      const { MobileNav } = await import("../app/components/Layout/MobileNav");
      const store = createTestStore({
        ui: { mobileMenuOpen: false },
      });

      const { container } = render(
        <Provider store={store}>
          <MobileNav />
        </Provider>
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render navigation links when open", async () => {
      const { MobileNav } = await import("../app/components/Layout/MobileNav");
      const store = createTestStore({
        ui: { mobileMenuOpen: true },
      });

      render(
        <Provider store={store}>
          <MobileNav />
        </Provider>
      );

      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Sites")).toBeDefined();
      expect(screen.getByText("Alerts")).toBeDefined();
      expect(screen.getByText("Settings")).toBeDefined();
    });
  });

  describe("MainLayout Component", () => {
    it("should render children content", async () => {
      const { MainLayout } = await import(
        "../app/components/Layout/MainLayout"
      );
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MainLayout>
            <div>Test Content</div>
          </MainLayout>
        </Provider>
      );

      expect(screen.getByText("Test Content")).toBeDefined();
    });

    it("should render with title", async () => {
      const { MainLayout } = await import(
        "../app/components/Layout/MainLayout"
      );
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MainLayout title="My Custom Title">
            <div>Content</div>
          </MainLayout>
        </Provider>
      );

      expect(screen.getByText("My Custom Title")).toBeDefined();
    });
  });
});

console.log("✅ All layout component tests defined");
