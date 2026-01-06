export interface Metric {
  id: number;
  siteId: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  tti?: number;
  deviceType: "mobile" | "desktop" | "tablet";
  browserName?: string;
  osName?: string;
  pageUrl?: string;
  pageTitle?: string;
  connectionType?: string;
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  sessionId?: string;
  userId?: string;
  timestamp: string;
}

export interface MetricSummary {
  avgLcp: number;
  avgFid: number;
  avgCls: number;
  p95Lcp: number;
  p95Fid: number;
  p95Cls: number;
  count: number;
}

export interface MetricFilters {
  timeRange?: "24h" | "7d" | "30d";
  deviceType?: "mobile" | "desktop" | "tablet";
  browserName?: string;
}
