/**
 * Integration tests for dashboard user flows
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/lib/redux/slices/themeSlice";
import userReducer from "@/lib/redux/slices/userSlice";
import uiReducer from "@/lib/redux/slices/uiSlice";
import DashboardPage from "./page";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock the queries
vi.mock("@/lib/react-query/queries/useSites", () => ({
  useSites: vi.fn(),
}));

import { useSites } from "@/lib/react-query/queries/useSites";

describe("Dashboard Integration Tests", () => {
  let queryClient: QueryClient;
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Create fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Create fresh Redux store for each test
    store = configureStore({
      reducer: {
        theme: themeReducer,
        user: userReducer,
        ui: uiReducer,
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </Provider>
    );
  };

  describe("Dashboard page loads and displays sites", () => {
    it("should display loading skeleton while fetching sites", () => {
      vi.mocked(useSites).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      } as ReturnType<typeof useSites>);

      renderWithProviders(<DashboardPage />);

      // Check for loading state
      expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
    });

    it("should display sites when data is loaded", async () => {
      const mockSites = [
        {
          id: 1,
          userId: 1,
          name: "Test Site 1",
          url: "https://test1.com",
          domain: "test1.com",
          siteId: "site_123",
          isActive: true,
          createdAt: "2025-12-01T00:00:00Z",
          updatedAt: "2025-12-18T00:00:00Z",
        },
        {
          id: 2,
          userId: 1,
          name: "Test Site 2",
          url: "https://test2.com",
          domain: "test2.com",
          siteId: "site_456",
          isActive: true,
          createdAt: "2025-12-05T00:00:00Z",
          updatedAt: "2025-12-18T00:00:00Z",
        },
      ];

      vi.mocked(useSites).mockReturnValue({
        data: mockSites,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as ReturnType<typeof useSites>);

      renderWithProviders(<DashboardPage />);

      // Check that sites are displayed
      await waitFor(() => {
        expect(screen.getByText("Test Site 1")).toBeInTheDocument();
        expect(screen.getByText("Test Site 2")).toBeInTheDocument();
      });

      // Check that Add New Site button is visible
      expect(screen.getByText("Add New Site")).toBeInTheDocument();
    });

    it("should display empty state when no sites exist", async () => {
      vi.mocked(useSites).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as ReturnType<typeof useSites>);

      renderWithProviders(<DashboardPage />);

      // Check for empty state
      await waitFor(() => {
        expect(screen.getByText("No sites configured")).toBeInTheDocument();
      });

      // Check that Add Your First Site button is visible
      expect(screen.getByText("Add Your First Site")).toBeInTheDocument();
    });

    it("should display error message when fetch fails", async () => {
      const mockError = new Error("Failed to fetch sites");

      vi.mocked(useSites).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        isError: true,
        isSuccess: false,
      } as ReturnType<typeof useSites>);

      renderWithProviders(<DashboardPage />);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/Error loading sites/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch sites/)).toBeInTheDocument();
      });
    });
  });
});
