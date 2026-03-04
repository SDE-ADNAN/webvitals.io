/**
 * Test data factories
 * Provides functions to create test data for users, sites, metrics, and alerts
 */

import { User, Site, Metric, Alert } from '@prisma/client';
import bcrypt from 'bcrypt';
import { testPrisma as prisma } from './database';

// Use require for uuid to avoid ESM issues in Jest
const { v4: uuidv4 } = require('uuid');

/**
 * Create a test user
 */
export async function createTestUser(
  overrides?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>
): Promise<User> {
  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(
    overrides?.password || defaultPassword,
    10
  );

  const user = await prisma.user.create({
    data: {
      email: overrides?.email || `test-${uuidv4()}@example.com`,
      password: hashedPassword,
      firstName: overrides?.firstName || 'Test',
      lastName: overrides?.lastName || 'User',
    },
  });

  return user;
}

/**
 * Create a test site
 */
export async function createTestSite(
  userId: string,
  overrides?: Partial<{
    name: string;
    url: string;
    domain: string;
    siteId: string;
    isActive: boolean;
  }>
): Promise<Site> {
  const defaultUrl = 'https://example.com';
  const url = overrides?.url || defaultUrl;
  const domain = overrides?.domain || new URL(url).hostname;

  const site = await prisma.site.create({
    data: {
      userId: parseInt(userId, 10),
      name: overrides?.name || 'Test Site',
      url,
      domain,
      siteId: overrides?.siteId || uuidv4(),
      isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
    },
  });

  return site;
}

/**
 * Create a test metric
 */
export async function createTestMetric(
  siteId: string,
  overrides?: Partial<{
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
    tti: number;
    deviceType: string;
    browserName: string;
    osName: string;
    timestamp: Date;
  }>
): Promise<Metric> {
  const metric = await prisma.metric.create({
    data: {
      siteId: parseInt(siteId, 10),
      lcp: overrides?.lcp || 2500,
      fid: overrides?.fid || 100,
      cls: overrides?.cls || 0.1,
      ttfb: overrides?.ttfb || 600,
      fcp: overrides?.fcp || 1800,
      tti: overrides?.tti || 3800,
      deviceType: overrides?.deviceType || 'desktop',
      browserName: overrides?.browserName || 'chrome',
      osName: overrides?.osName || 'windows',
      timestamp: overrides?.timestamp || new Date(),
    },
  });

  return metric;
}

/**
 * Create a test alert
 */
export async function createTestAlert(
  userId: string,
  siteId: string,
  overrides?: Partial<{
    metricType: string;
    condition: string;
    threshold: number;
    isActive: boolean;
  }>
): Promise<Alert> {
  const alert = await prisma.alert.create({
    data: {
      userId: parseInt(userId, 10),
      siteId: parseInt(siteId, 10),
      metricType: overrides?.metricType || 'lcp',
      condition: overrides?.condition || 'greater_than',
      threshold: overrides?.threshold || 3000,
      isActive: overrides?.isActive !== undefined ? overrides.isActive : true,
    },
  });

  return alert;
}

/**
 * Create a complete test setup with user, site, metrics, and alerts
 */
export async function createTestSetup(options?: {
  userOverrides?: Parameters<typeof createTestUser>[0];
  siteOverrides?: Parameters<typeof createTestSite>[1];
  metricsCount?: number;
  alertsCount?: number;
}): Promise<{
  user: User;
  site: Site;
  metrics: Metric[];
  alerts: Alert[];
}> {
  const user = await createTestUser(options?.userOverrides);
  const site = await createTestSite(user.id, options?.siteOverrides);

  const metrics: Metric[] = [];
  const metricsCount = options?.metricsCount || 0;
  for (let i = 0; i < metricsCount; i++) {
    const metric = await createTestMetric(site.id);
    metrics.push(metric);
  }

  const alerts: Alert[] = [];
  const alertsCount = options?.alertsCount || 0;
  for (let i = 0; i < alertsCount; i++) {
    const alert = await createTestAlert(user.id, site.id);
    alerts.push(alert);
  }

  return { user, site, metrics, alerts };
}

/**
 * Create multiple test users
 */
export async function createTestUsers(count: number): Promise<User[]> {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser();
    users.push(user);
  }
  return users;
}

/**
 * Create multiple test sites for a user
 */
export async function createTestSites(
  userId: string,
  count: number
): Promise<Site[]> {
  const sites: Site[] = [];
  for (let i = 0; i < count; i++) {
    const site = await createTestSite(userId, {
      name: `Test Site ${i + 1}`,
      url: `https://example${i + 1}.com`,
    });
    sites.push(site);
  }
  return sites;
}

/**
 * Create multiple test metrics for a site
 */
export async function createTestMetrics(
  siteId: string,
  count: number,
  overrides?: Parameters<typeof createTestMetric>[1]
): Promise<Metric[]> {
  const metrics: Metric[] = [];
  for (let i = 0; i < count; i++) {
    const metric = await createTestMetric(siteId, overrides);
    metrics.push(metric);
  }
  return metrics;
}

/**
 * Create multiple test alerts for a user and site
 */
export async function createTestAlerts(
  userId: string,
  siteId: string,
  count: number
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const metricTypes = ['lcp', 'fid', 'cls'];
  for (let i = 0; i < count; i++) {
    const alert = await createTestAlert(userId, siteId, {
      metricType: metricTypes[i % metricTypes.length],
    });
    alerts.push(alert);
  }
  return alerts;
}
