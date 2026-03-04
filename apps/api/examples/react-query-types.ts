/**
 * TypeScript Type Definitions for WebVitals.io API
 * 
 * These types match the backend API responses exactly.
 * Copy this file to your frontend project (e.g., lib/api/types.ts)
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================================================
// Site Types
// ============================================================================

export interface Site {
  id: number;
  userId: number;
  name: string;
  url: string;
  domain: string;
  siteId: string; // Public tracking ID for SDK
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateSiteInput {
  name: string;
  url: string;
}

export interface UpdateSiteInput {
  name?: string;
  url?: string;
  isActive?: boolean;
}

// ============================================================================
// Metric Types
// ============================================================================

export interface Metric {
  id: number;
  siteId: number;
  lcp: number | null; // Largest Contentful Paint (ms)
  fid: number | null; // First Input Delay (ms)
  cls: number | null; // Cumulative Layout Shift (score)
  ttfb: number | null; // Time to First Byte (ms)
  fcp: number | null; // First Contentful Paint (ms)
  tti: number | null; // Time to Interactive (ms)
  deviceType: string; // 'desktop' | 'mobile' | 'tablet'
  browserName: string | null;
  osName: string | null;
  pageUrl: string | null;
  pageTitle: string | null;
  connectionType: string | null;
  effectiveType: string | null;
  rtt: number | null;
  downlink: number | null;
  sessionId: string | null;
  userId: string | null;
  timestamp: string; // ISO 8601 format
}

export interface MetricsSummary {
  avgLcp: number;
  avgFid: number;
  avgCls: number;
  p95Lcp: number;
  p95Fid: number;
  p95Cls: number;
  count: number;
}

export interface MetricsFilters {
  timeRange?: '24h' | '7d' | '30d';
  deviceType?: string;
  browserName?: string;
}

export interface SubmitMetricInput {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  tti?: number;
  deviceType: string;
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
}

// ============================================================================
// Alert Types
// ============================================================================

export interface Alert {
  id: number;
  userId: number;
  siteId: number;
  metricType: 'lcp' | 'fid' | 'cls';
  threshold: number;
  condition: 'greater_than' | 'less_than';
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export interface CreateAlertInput {
  siteId: number;
  metricType: 'lcp' | 'fid' | 'cls';
  threshold: number;
  condition: 'greater_than' | 'less_than';
}

export interface UpdateAlertInput {
  threshold?: number;
  condition?: 'greater_than' | 'less_than';
  isActive?: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string>;
}

export interface SuccessResponse<T> {
  data: T;
}

// Specific response wrappers
export interface UserResponse {
  user: User;
}

export interface SiteResponse {
  site: Site;
}

export interface SitesResponse {
  sites: Site[];
}

export interface MetricsResponse {
  metrics: Metric[];
}

export interface MetricsSummaryResponse {
  summary: MetricsSummary;
}

export interface AlertResponse {
  alert: Alert;
}

export interface AlertsResponse {
  alerts: Alert[];
}

export interface DeleteResponse {
  message: string;
}
