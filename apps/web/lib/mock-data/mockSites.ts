import { Site } from "./types";

// Extended Site type with lastMetric for dashboard display
export type SiteWithMetrics = Site & {
  lastMetric?: {
    lcp: number;
    fid: number;
    cls: number;
  };
};

// Sample site data (2-3 sites as specified in requirements)
export const mockSites: SiteWithMetrics[] = [
  {
    id: 1,
    userId: 1,
    name: "My Portfolio",
    url: "https://myportfolio.com",
    domain: "myportfolio.com",
    siteId: "site_abc123",
    isActive: true,
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2025-12-14T00:00:00Z",
    lastMetric: {
      lcp: 2100,
      fid: 85,
      cls: 0.08,
    },
  },
  {
    id: 2,
    userId: 1,
    name: "E-commerce Store",
    url: "https://mystore.com",
    domain: "mystore.com",
    siteId: "site_def456",
    isActive: true,
    createdAt: "2025-12-05T00:00:00Z",
    updatedAt: "2025-12-14T00:00:00Z",
    lastMetric: {
      lcp: 3200,
      fid: 150,
      cls: 0.15,
    },
  },
  {
    id: 3,
    userId: 1,
    name: "Blog Platform",
    url: "https://myblog.dev",
    domain: "myblog.dev",
    siteId: "site_ghi789",
    isActive: true,
    createdAt: "2025-12-10T00:00:00Z",
    updatedAt: "2025-12-15T00:00:00Z",
    lastMetric: {
      lcp: 1800,
      fid: 65,
      cls: 0.05,
    },
  },
];

/**
 * Get all mock sites with simulated network delay
 * @returns Promise resolving to array of sites with metrics
 */
export function getMockSites(): Promise<SiteWithMetrics[]> {
  return new Promise((resolve) => {
    // Simulate network delay of 500ms
    setTimeout(() => resolve(mockSites), 500);
  });
}

/**
 * Get a single mock site by siteId with simulated network delay
 * @param siteId - The public site ID to look up
 * @returns Promise resolving to site or null if not found
 */
export function getMockSite(siteId: string): Promise<SiteWithMetrics | null> {
  return new Promise((resolve) => {
    // Simulate network delay of 300ms
    setTimeout(() => {
      const site = mockSites.find((s) => s.siteId === siteId);
      resolve(site || null);
    }, 300);
  });
}
