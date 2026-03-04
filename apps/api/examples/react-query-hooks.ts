/**
 * React Query Hooks for WebVitals.io API
 * 
 * Complete set of hooks for authentication, sites, metrics, and alerts.
 * Copy this file to your frontend project (e.g., lib/api/hooks.ts)
 */

import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient, { setAuthToken, removeAuthToken, getErrorMessage } from './react-query-client';
import type {
  User,
  AuthResponse,
  RegisterInput,
  LoginInput,
  Site,
  CreateSiteInput,
  UpdateSiteInput,
  Metric,
  MetricsSummary,
  MetricsFilters,
  Alert,
  CreateAlertInput,
  UpdateAlertInput,
  UserResponse,
  SiteResponse,
  SitesResponse,
  MetricsResponse,
  MetricsSummaryResponse,
  AlertResponse,
  AlertsResponse,
  DeleteResponse,
} from './react-query-types';

// ============================================================================
// Query Keys
// ============================================================================

export const queryKeys = {
  // Auth
  currentUser: ['auth', 'me'] as const,
  
  // Sites
  sites: ['sites'] as const,
  site: (siteId: string) => ['sites', siteId] as const,
  
  // Metrics
  metrics: (siteId: string, filters?: MetricsFilters) => 
    ['metrics', siteId, filters] as const,
  metricsSummary: (siteId: string, filters?: MetricsFilters) => 
    ['metrics', siteId, 'summary', filters] as const,
  
  // Alerts
  alerts: ['alerts'] as const,
  alert: (alertId: number) => ['alerts', alertId] as const,
};

// ============================================================================
// Authentication Hooks
// ============================================================================

/**
 * Register a new user
 */
export function useRegister(
  options?: UseMutationOptions<AuthResponse, Error, RegisterInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', input);
      return data;
    },
    onSuccess: (data) => {
      // Store token
      setAuthToken(data.token);
      
      // Update current user cache
      queryClient.setQueryData(queryKeys.currentUser, { user: data.user });
    },
    ...options,
  });
}

/**
 * Login user
 */
export function useLogin(
  options?: UseMutationOptions<AuthResponse, Error, LoginInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
      return data;
    },
    onSuccess: (data) => {
      // Store token
      setAuthToken(data.token);
      
      // Update current user cache
      queryClient.setQueryData(queryKeys.currentUser, { user: data.user });
    },
    ...options,
  });
}

/**
 * Logout user
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Remove token
      removeAuthToken();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

/**
 * Get current authenticated user
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<UserResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<UserResponse, Error>({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>('/auth/me');
      return data;
    },
    ...options,
  });
}

// ============================================================================
// Site Management Hooks
// ============================================================================

/**
 * Get all sites for current user
 */
export function useSites(
  options?: Omit<UseQueryOptions<SitesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SitesResponse, Error>({
    queryKey: queryKeys.sites,
    queryFn: async () => {
      const { data } = await apiClient.get<SitesResponse>('/sites');
      return data;
    },
    ...options,
  });
}

/**
 * Get a specific site by ID
 */
export function useSite(
  siteId: string,
  options?: Omit<UseQueryOptions<SiteResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SiteResponse, Error>({
    queryKey: queryKeys.site(siteId),
    queryFn: async () => {
      const { data } = await apiClient.get<SiteResponse>(`/sites/${siteId}`);
      return data;
    },
    enabled: !!siteId,
    ...options,
  });
}

/**
 * Create a new site
 */
export function useCreateSite(
  options?: UseMutationOptions<SiteResponse, Error, CreateSiteInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<SiteResponse, Error, CreateSiteInput>({
    mutationFn: async (input: CreateSiteInput) => {
      const { data } = await apiClient.post<SiteResponse>('/sites', input);
      return data;
    },
    onSuccess: () => {
      // Invalidate sites list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.sites });
    },
    ...options,
  });
}

/**
 * Update a site
 */
export function useUpdateSite(
  options?: UseMutationOptions<SiteResponse, Error, { siteId: string; input: UpdateSiteInput }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<SiteResponse, Error, { siteId: string; input: UpdateSiteInput }>({
    mutationFn: async ({ siteId, input }) => {
      const { data } = await apiClient.put<SiteResponse>(`/sites/${siteId}`, input);
      return data;
    },
    onSuccess: (data, variables) => {
      // Update specific site cache
      queryClient.setQueryData(queryKeys.site(variables.siteId), data);
      
      // Invalidate sites list
      queryClient.invalidateQueries({ queryKey: queryKeys.sites });
    },
    ...options,
  });
}

/**
 * Delete a site
 */
export function useDeleteSite(
  options?: UseMutationOptions<DeleteResponse, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteResponse, Error, string>({
    mutationFn: async (siteId: string) => {
      const { data } = await apiClient.delete<DeleteResponse>(`/sites/${siteId}`);
      return data;
    },
    onSuccess: (_, siteId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.site(siteId) });
      
      // Invalidate sites list
      queryClient.invalidateQueries({ queryKey: queryKeys.sites });
    },
    ...options,
  });
}

// ============================================================================
// Metrics Hooks
// ============================================================================

/**
 * Get metrics for a site with optional filters
 */
export function useMetrics(
  siteId: string,
  filters?: MetricsFilters,
  options?: Omit<UseQueryOptions<MetricsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MetricsResponse, Error>({
    queryKey: queryKeys.metrics(siteId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.deviceType) params.append('deviceType', filters.deviceType);
      if (filters?.browserName) params.append('browserName', filters.browserName);
      
      const { data } = await apiClient.get<MetricsResponse>(
        `/metrics/${siteId}?${params.toString()}`
      );
      return data;
    },
    enabled: !!siteId,
    ...options,
  });
}

/**
 * Get metrics summary for a site
 */
export function useMetricsSummary(
  siteId: string,
  filters?: MetricsFilters,
  options?: Omit<UseQueryOptions<MetricsSummaryResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MetricsSummaryResponse, Error>({
    queryKey: queryKeys.metricsSummary(siteId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.deviceType) params.append('deviceType', filters.deviceType);
      if (filters?.browserName) params.append('browserName', filters.browserName);
      
      const { data } = await apiClient.get<MetricsSummaryResponse>(
        `/metrics/${siteId}/summary?${params.toString()}`
      );
      return data;
    },
    enabled: !!siteId,
    ...options,
  });
}

// ============================================================================
// Alert Management Hooks
// ============================================================================

/**
 * Get all alerts for current user
 */
export function useAlerts(
  options?: Omit<UseQueryOptions<AlertsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AlertsResponse, Error>({
    queryKey: queryKeys.alerts,
    queryFn: async () => {
      const { data } = await apiClient.get<AlertsResponse>('/alerts');
      return data;
    },
    ...options,
  });
}

/**
 * Create a new alert
 */
export function useCreateAlert(
  options?: UseMutationOptions<AlertResponse, Error, CreateAlertInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<AlertResponse, Error, CreateAlertInput>({
    mutationFn: async (input: CreateAlertInput) => {
      const { data } = await apiClient.post<AlertResponse>('/alerts', input);
      return data;
    },
    onSuccess: () => {
      // Invalidate alerts list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },
    ...options,
  });
}

/**
 * Update an alert
 */
export function useUpdateAlert(
  options?: UseMutationOptions<AlertResponse, Error, { alertId: number; input: UpdateAlertInput }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<AlertResponse, Error, { alertId: number; input: UpdateAlertInput }>({
    mutationFn: async ({ alertId, input }) => {
      const { data } = await apiClient.put<AlertResponse>(`/alerts/${alertId}`, input);
      return data;
    },
    onSuccess: () => {
      // Invalidate alerts list
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },
    ...options,
  });
}

/**
 * Delete an alert
 */
export function useDeleteAlert(
  options?: UseMutationOptions<DeleteResponse, Error, number>
) {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteResponse, Error, number>({
    mutationFn: async (alertId: number) => {
      const { data } = await apiClient.delete<DeleteResponse>(`/alerts/${alertId}`);
      return data;
    },
    onSuccess: () => {
      // Invalidate alerts list
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },
    ...options,
  });
}
