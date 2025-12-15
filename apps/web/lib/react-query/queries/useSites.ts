import { useQuery } from "@tanstack/react-query";
import { getMockSites, getMockSite } from "../../mock-data/mockSites";
import type { Site } from "@webvitals/types";

/**
 * React Query hook to fetch all sites
 * Query key: ['sites']
 * 
 * Week 1: Uses mock data from getMockSites()
 * Week 3: Will be updated to use API client
 * 
 * @returns React Query result with sites array
 */
export function useSites() {
  return useQuery<Site[], Error>({
    queryKey: ["sites"],
    queryFn: async () => {
      // Week 1: Return mock data
      // Week 3: Replace with API call
      // const response = await apiClient.get<Site[]>("/sites");
      // return response.data;
      return getMockSites();
    },
  });
}

/**
 * React Query hook to fetch a single site by siteId
 * Query key: ['sites', siteId]
 * 
 * Week 1: Uses mock data from getMockSite()
 * Week 3: Will be updated to use API client
 * 
 * @param siteId - The public site ID to fetch
 * @returns React Query result with site or null
 */
export function useSite(siteId: string) {
  return useQuery<Site | null, Error>({
    queryKey: ["sites", siteId],
    queryFn: async () => {
      // Week 1: Return mock data
      // Week 3: Replace with API call
      // const response = await apiClient.get<Site>(`/sites/${siteId}`);
      // return response.data;
      return getMockSite(siteId);
    },
    enabled: !!siteId, // Only run query if siteId is provided
  });
}
