/**
 * Property-based tests for alert service
 * Feature: backend-api
 * 
 * Property 21: Alert Ownership Verification
 * For any alert operation, if user doesn't own alert, return 403
 * Validates: Requirements 16.2, 17.2
 */

import * as fc from 'fast-check';
import { prisma } from '../lib/prisma';

// Mock prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    site: {
      findUnique: jest.fn(),
    },
    alert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Alert Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 21: Alert Ownership Verification
   * For any alert operation, if user doesn't own alert, return 403
   * Validates: Requirements 16.2, 17.2
   */
  describe('Feature: backend-api, Property 21: Alert Ownership Verification', () => {
    it('should return 403 for any unauthorized alert update attempt', async () => {
      const { updateAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // owner userId
          fc.integer({ min: 1, max: 1000000 }), // requester userId
          async (alertId, ownerId, requesterId) => {
            // Ensure different users
            fc.pre(ownerId !== requesterId);

            const mockAlert = {
              id: alertId,
              userId: ownerId,
              siteId: 1,
              metricType: 'lcp',
              threshold: 2500,
              condition: 'greater_than',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);

            // Property: Update by non-owner should return 403
            try {
              await updateAlert(alertId, requesterId, { threshold: 3000 });
              fail('Expected ownership verification to throw 403');
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(403);
              expect((error as Error).message).toContain('permission');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 403 for any unauthorized alert delete attempt', async () => {
      const { deleteAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // owner userId
          fc.integer({ min: 1, max: 1000000 }), // requester userId
          async (alertId, ownerId, requesterId) => {
            // Ensure different users
            fc.pre(ownerId !== requesterId);

            const mockAlert = {
              id: alertId,
              userId: ownerId,
              siteId: 1,
              metricType: 'fid',
              threshold: 100,
              condition: 'greater_than',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);

            // Property: Delete by non-owner should return 403
            try {
              await deleteAlert(alertId, requesterId);
              fail('Expected ownership verification to throw 403');
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(403);
              expect((error as Error).message).toContain('permission');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow update when user owns the alert', async () => {
      const { updateAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // userId (owner and requester)
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }), // new threshold
          async (alertId, userId, newThreshold) => {
            const mockAlert = {
              id: alertId,
              userId, // Alert belongs to the requester
              siteId: 1,
              metricType: 'cls',
              threshold: 0.1,
              condition: 'greater_than',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const updatedAlert = {
              ...mockAlert,
              threshold: newThreshold,
            };

            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);
            (prisma.alert.update as jest.Mock).mockResolvedValue(updatedAlert);

            // Property: Update by owner should succeed
            const result = await updateAlert(alertId, userId, { threshold: newThreshold });
            expect(result.threshold).toBe(newThreshold);
            expect(result.userId).toBe(userId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow delete when user owns the alert', async () => {
      const { deleteAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // userId (owner and requester)
          async (alertId, userId) => {
            const mockAlert = {
              id: alertId,
              userId, // Alert belongs to the requester
              siteId: 1,
              metricType: 'lcp',
              threshold: 2500,
              condition: 'less_than',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);
            (prisma.alert.delete as jest.Mock).mockResolvedValue(mockAlert);

            // Property: Delete by owner should succeed without error
            await expect(deleteAlert(alertId, userId)).resolves.not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 404 when alert does not exist for any operation', async () => {
      const { updateAlert, deleteAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // userId
          fc.constantFrom('update', 'delete'),
          async (alertId, userId, operation) => {
            // Mock: Alert does not exist
            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(null);

            // Property: Any operation on non-existent alert should return 404
            try {
              switch (operation) {
                case 'update':
                  await updateAlert(alertId, userId, { threshold: 1000 });
                  break;
                case 'delete':
                  await deleteAlert(alertId, userId);
                  break;
              }
              fail(`Expected ${operation} operation to throw 404 for non-existent alert`);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(404);
              expect((error as Error).message).toContain('not found');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 403 for any alert operation by non-owner', async () => {
      const { updateAlert, deleteAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // alertId
          fc.integer({ min: 1, max: 1000000 }), // owner userId
          fc.integer({ min: 1, max: 1000000 }), // requester userId
          fc.constantFrom('update', 'delete'),
          async (alertId, ownerId, requesterId, operation) => {
            // Ensure different users
            fc.pre(ownerId !== requesterId);

            const mockAlert = {
              id: alertId,
              userId: ownerId,
              siteId: 1,
              metricType: 'lcp',
              threshold: 2500,
              condition: 'greater_than',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.alert.findUnique as jest.Mock).mockResolvedValue(mockAlert);

            // Property: Any operation by non-owner should return 403
            try {
              switch (operation) {
                case 'update':
                  await updateAlert(alertId, requesterId, { threshold: 3000 });
                  break;
                case 'delete':
                  await deleteAlert(alertId, requesterId);
                  break;
              }
              fail(`Expected ${operation} operation to throw 403 for non-owner`);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(403);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional test: List alerts returns empty array for users with no alerts
   * Validates: Requirements 15.4
   */
  describe('Feature: backend-api, Property 22: Empty Array for No Results (Alerts)', () => {
    it('should return empty array for any user with no alerts', async () => {
      const { listAlerts } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 1000000 }), // Any valid user ID
          async (userId) => {
            // Mock: No alerts exist for this user
            (prisma.alert.findMany as jest.Mock).mockResolvedValue([]);

            const result = await listAlerts(userId);

            // Property: Result should always be an empty array, not null or undefined
            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional test: Create alert verifies site ownership
   * Validates: Requirements 14.2
   */
  describe('Feature: backend-api, Create Alert Site Ownership', () => {
    it('should return 403 when creating alert for site user does not own', async () => {
      const { createAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // siteId (public)
          fc.integer({ min: 1, max: 1000000 }), // site owner userId
          fc.integer({ min: 1, max: 1000000 }), // requester userId
          fc.constantFrom('lcp', 'fid', 'cls'),
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
          fc.constantFrom('greater_than', 'less_than'),
          async (siteId, siteOwnerId, requesterId, metricType, threshold, condition) => {
            // Ensure different users
            fc.pre(siteOwnerId !== requesterId);

            const mockSite = {
              id: 1,
              siteId,
              name: 'Test Site',
              url: 'https://example.com',
              domain: 'example.com',
              isActive: true,
              userId: siteOwnerId, // Site belongs to different user
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.site.findUnique as jest.Mock).mockResolvedValue(mockSite);

            // Property: Creating alert for site user doesn't own should return 403
            try {
              await createAlert(requesterId, {
                siteId,
                metricType: metricType as 'lcp' | 'fid' | 'cls',
                threshold,
                condition: condition as 'greater_than' | 'less_than',
              });
              fail('Expected ownership verification to throw 403');
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as any).statusCode).toBe(403);
              expect((error as Error).message).toContain('permission');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow creating alert when user owns the site', async () => {
      const { createAlert } = await import('./alertService');

      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // siteId (public)
          fc.integer({ min: 1, max: 1000000 }), // userId (owner)
          fc.constantFrom('lcp', 'fid', 'cls'),
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
          fc.constantFrom('greater_than', 'less_than'),
          async (siteId, userId, metricType, threshold, condition) => {
            const mockSite = {
              id: 1,
              siteId,
              name: 'Test Site',
              url: 'https://example.com',
              domain: 'example.com',
              isActive: true,
              userId, // Site belongs to the requester
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const mockAlert = {
              id: 1,
              userId,
              siteId: mockSite.id,
              metricType,
              threshold,
              condition,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            (prisma.site.findUnique as jest.Mock).mockResolvedValue(mockSite);
            (prisma.alert.create as jest.Mock).mockResolvedValue(mockAlert);

            // Property: Creating alert for owned site should succeed
            const result = await createAlert(userId, {
              siteId,
              metricType: metricType as 'lcp' | 'fid' | 'cls',
              threshold,
              condition: condition as 'greater_than' | 'less_than',
            });

            expect(result.userId).toBe(userId);
            expect(result.metricType).toBe(metricType);
            expect(result.threshold).toBe(threshold);
            expect(result.condition).toBe(condition);
            expect(result.isActive).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
