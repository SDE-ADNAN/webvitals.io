import { useQuery } from "@tanstack/react-query";
import { getMockMetrics } from "../../mock-data/mockMetrics";
import type { Metric, MetricSummary, MetricFilters } from "@webvitals/types";

/**
 * Response type for metrics query
 */
export interface MetricsResponse {
  metrics: Metric[];
  summary: MetricSummary;
}

/**
 * React Query hook to fetch metrics for a site with optional filters
 * Query key: ['metrics', siteId, filters]
 * 
 * Week 1: Uses mock data from getMockMetrics()
 * Week 3: Will be updated to use API client
 * 
 * @param siteId - The site ID to fetch metrics for
 * @param filters - Optional filters for device type, browser, and time range
 * @returns React Query result with metrics array and summary statistics
 */
export function useMetrics(siteId: string, filters?: MetricFilters) {
  return useQuery<MetricsResponse, Error>({
    queryKey: ["metrics", siteId, filters],
    queryFn: async () => {
      // Week 1: Return mock data
      // Week 3: Replace with API call
      // const params = new URLSearchParams();
      // if (filters?.deviceType) params.append('deviceType', filters.deviceType);
      // if (filters?.browserName) params.append('browserName', filters.browserName);
      // if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      // const response = await apiClient.get<MetricsResponse>(
      //   `/sites/${siteId}/metrics?${params.toString()}`
      // );
      // return response.data;
      
      const result = await getMockMetrics(siteId, filters);
      return result;
    },
    enabled: !!siteId, // Only run query if siteId is provided
  });
}
