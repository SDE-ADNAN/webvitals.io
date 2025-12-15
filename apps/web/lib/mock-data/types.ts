// Mock data type definitions
// These types extend the base types from @repo/types with additional mock-specific properties

import { Site, Metric, MetricSummary } from "@repo/types";

export type { Site, Metric, MetricSummary };

// Mock data response types
export interface MockSitesResponse {
  sites: Site[];
}

export interface MockMetricsResponse {
  metrics: Metric[];
  summary: MetricSummary;
}
