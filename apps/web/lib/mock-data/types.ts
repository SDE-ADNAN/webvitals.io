// Mock data type definitions
// These types extend the base types from @webvitals/types with additional mock-specific properties

import { Site, Metric, MetricSummary, MetricFilters } from "@webvitals/types";

export type { Site, Metric, MetricSummary, MetricFilters };

// Mock data response types
export interface MockSitesResponse {
  sites: Site[];
}

export interface MockMetricsResponse {
  metrics: Metric[];
  summary: MetricSummary;
}
