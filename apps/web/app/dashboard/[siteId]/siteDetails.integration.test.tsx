/**
 * Integration tests for site details page user flows
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/lib/redux/slices/themeSlice";
import userReducer from "@/lib/redux/slices/userSlice";
import uiReducer from "@/lib/redux/slices/uiSlice";
import SiteDetailsPage from "./page";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ siteId: "site_123" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard/site_123",
}));

// Mock the queries
vi.mock("@/lib/react-query/queries/useSites", () => ({
  useSite: vi.fn(),
}));

vi.mock("@/lib/react-query/queries/useMetrics", () => ({
  useMetrics: vi.fn(),
}));

import { useSite } from "@/lib/react-query/queries/useSites";
import { useMetrics } from "@/lib/react-query/queries/useMetrics";

describe("Site Details Integration Tests", () => {
  let queryClient: QueryClient;
  let store: ReturnType<typeof configureStore>;

  const mockSite = {
    id: 1,
    userId: 1,
    name: "Test Site",
    url: "https://test.com",
    domain: "test.com",
    siteId: "site_123",
    isActive: true,
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2025-12-18T00:00:00Z",
  };

  const mockMetrics = [
    {
      id: 1,
      siteId: 1,
      lcp: 2000,
      fid: 80,
      cls: 0.08,
      deviceType: "desktop" as const,
      browserName: "Chrome",
      timestamp: "2025-12-18T10:00:00Z",
    },
    {
      id: 2,
      siteId: 1,
      lcp: 3000,
      fid: 120,
      cls: 0.15,
      deviceType: "mobile" as const,
      browserName: "Safari",
      timestamp: "2025-12-18T11:00:00Z",
    },
  ];

  const mockSummary = {
    avgLcp: 2500,
    avgFid: 100,
    avgCls: 0.115,
    p95Lcp: 3000,
    p95Fid: 120,
    p95Cls: 0.15,
    count: 2,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    store = configureStore({
      reducer: {
        theme: themeReducer,
        user: userReducer,
        ui: uiReducer,
      },
    });

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

  describe("Site details page loads and displays metrics", () => {
    it("should display loading state while fetching data", () => {
      vi.mocked(useSite).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      } as ReturnType<typeof useSite>);

      vi.mocked(useMetrics).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      } as ReturnType<typeof useMetrics>);

      const { container } = renderWithProviders(<SiteDetailsPage />);

      // Check for loading skeletons by class
      const loadingElements = container.querySelectorAll(".animate-pulse");
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it("should display site information and metrics when loaded", async () => {
      vi.mocked(useSite).mockReturnValue({
        data: mockSite,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useSite>);

      vi.mocked(useMetrics).mockReturnValue({
        data: { metrics: mockMetrics, summary: mockSummary },
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      // Check site header
      await waitFor(() => {
        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByText("https://test.com")).toBeInTheDocument();
      });

      // Check metric cards are displayed
      expect(screen.getByText("Largest Contentful Paint (LCP)")).toBeInTheDocument();
      expect(screen.getByText("First Input Delay (FID)")).toBeInTheDocument();
      expect(screen.getByText("Cumulative Layout Shift (CLS)")).toBeInTheDocument();
    });

    it("should display error when site not found", async () => {
      vi.mocked(useSite).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Site not found"),
      } as ReturnType<typeof useSite>);

      vi.mocked(useMetrics).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText("Error loading site")).toBeInTheDocument();
        expect(screen.getByText("Site not found")).toBeInTheDocument();
      });
    });
  });

  describe("Filters update charts correctly", () => {
    it("should have default time range of 24h selected", async () => {
      vi.mocked(useSite).mockReturnValue({
        data: mockSite,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useSite>);

      vi.mocked(useMetrics).mockReturnValue({
        data: { metrics: mockMetrics, summary: mockSummary },
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      await waitFor(() => {
        const button24h = screen.getByRole("button", { name: /24 hours/i });
        expect(button24h).toHaveClass("bg-blue-600");
      });
    });

    it("should update time range when selector is clicked", async () => {
      const user = userEvent.setup();

      vi.mocked(useSite).mockReturnValue({
        data: mockSite,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useSite>);

      const mockUseMetrics = vi.mocked(useMetrics);
      mockUseMetrics.mockReturnValue({
        data: { metrics: mockMetrics, summary: mockSummary },
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Site")).toBeInTheDocument();
      });

      // Click 7 Days button
      const button7d = screen.getByRole("button", { name: /7 days/i });
      await user.click(button7d);

      // Check that useMetrics was called with updated timeRange
      await waitFor(() => {
        const calls = mockUseMetrics.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall?.[1]).toMatchObject({ timeRange: "7d" });
      });
    });

    it("should update device filter when changed", async () => {
      const user = userEvent.setup();

      vi.mocked(useSite).mockReturnValue({
        data: mockSite,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useSite>);

      const mockUseMetrics = vi.mocked(useMetrics);
      mockUseMetrics.mockReturnValue({
        data: { metrics: mockMetrics, summary: mockSummary },
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Site")).toBeInTheDocument();
      });

      // Find and click device filter dropdown
      const deviceSelect = screen.getByLabelText(/device type/i);
      await user.selectOptions(deviceSelect, "mobile");

      // Check that useMetrics was called with device filter
      await waitFor(() => {
        const calls = mockUseMetrics.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall?.[1]).toMatchObject({ deviceType: "mobile" });
      });
    });

    it("should clear all filters when clear button is clicked", async () => {
      const user = userEvent.setup();

      vi.mocked(useSite).mockReturnValue({
        data: mockSite,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useSite>);

      const mockUseMetrics = vi.mocked(useMetrics);
      mockUseMetrics.mockReturnValue({
        data: { metrics: mockMetrics, summary: mockSummary },
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetrics>);

      renderWithProviders(<SiteDetailsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Site")).toBeInTheDocument();
      });

      // Set a device filter
      const deviceSelect = screen.getByLabelText(/device type/i);
      await user.selectOptions(deviceSelect, "mobile");

      // Click clear filters button
      const clearButton = screen.getByRole("button", { name: /clear filters/i });
      await user.click(clearButton);

      // Check that filters are reset
      await waitFor(() => {
        expect(deviceSelect).toHaveValue("all");
      });
    });
  });
});
