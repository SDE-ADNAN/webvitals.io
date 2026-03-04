/**
 * Property-based tests for ISO 8601 timestamp format across all API endpoints
 * Feature: backend-api, Property 13: ISO 8601 Timestamp Format
 * Validates: Requirements 26.5
 * 
 * This test verifies that all API endpoints returning timestamp data
 * format those timestamps in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */

// Mock uuid before other imports
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

import * as fc from "fast-check";
import request from "supertest";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Import routes
import authRoutes from "../routes/authRoutes";
import siteRoutes from "../routes/siteRoutes";
import metricRoutes from "../routes/metricRoutes";
import alertRoutes from "../routes/alertRoutes";
import { prisma } from "../lib/prisma";

/**
 * ISO 8601 format regex: YYYY-MM-DDTHH:mm:ss.sssZ
 * Examples:
 * - 2024-01-15T10:30:45.123Z
 * - 2023-12-31T23:59:59.999Z
 */
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Recursively check all timestamp fields in an object
 * Returns array of invalid timestamp paths
 */
function findInvalidTimestamps(obj: any, path: string = ""): string[] {
  const invalid: string[] = [];

  if (obj === null || obj === undefined) {
    return invalid;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      invalid.push(...findInvalidTimestamps(item, `${path}[${index}]`));
    });
    return invalid;
  }

  if (typeof obj === "object") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this is a timestamp field
        if (
          key === "createdAt" ||
          key === "updatedAt" ||
          key === "timestamp"
        ) {
          const value = obj[key];
          if (typeof value === "string") {
            if (!ISO_8601_REGEX.test(value)) {
              invalid.push(currentPath);
            }
          } else if (value instanceof Date) {
            // Timestamps should be strings, not Date objects
            invalid.push(`${currentPath} (Date object, not string)`);
          }
        }
        
        // Recursively check nested objects
        invalid.push(...findInvalidTimestamps(obj[key], currentPath));
      }
    }
  }

  return invalid;
}

/**
 * Property 13: ISO 8601 Timestamp Format
 * For any response with timestamps, they should be in ISO 8601 format
 * **Validates: Requirements 26.5**
 */
describe("Feature: backend-api, Property 13: ISO 8601 Timestamp Format", () => {
  let app: Express;
  let testUser: any;
  let authToken: string;
  let testSite: any;

  beforeAll(async () => {
    // Set up Express app with routes
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api/sites", siteRoutes);
    app.use("/api/metrics", metricRoutes);
    app.use("/api/alerts", alertRoutes);

    // Create test user
    const hashedPassword = await bcrypt.hash("testpassword123", 10);
    testUser = await prisma.user.create({
      data: {
        email: `test-timestamp-${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
      },
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser.id.toString(), email: testUser.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "7d" }
    );

    // Create test site
    testSite = await prisma.site.create({
      data: {
        siteId: `site-timestamp-${Date.now()}`,
        name: "Test Site",
        url: "https://example.com",
        domain: "example.com",
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.metric.deleteMany({ where: { siteId: testSite.id } });
    await prisma.alert.deleteMany({ where: { userId: testUser.id } });
    await prisma.site.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe("Authentication Endpoints", () => {
    it("should format timestamps in ISO 8601 for user registration", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (email, password, firstName, lastName) => {
            const uniqueEmail = `${Date.now()}-${email}`;

            const response = await request(app)
              .post("/api/auth/register")
              .send({ email: uniqueEmail, password, firstName, lastName });

            if (response.status === 201) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check user timestamps
              if (response.body.user) {
                expect(response.body.user.createdAt).toMatch(ISO_8601_REGEX);
                expect(response.body.user.updatedAt).toMatch(ISO_8601_REGEX);
              }

              // Clean up
              if (response.body.user) {
                await prisma.user.delete({
                  where: { id: response.body.user.id },
                });
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should format timestamps in ISO 8601 for user login", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testUser), async (user) => {
          const response = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "testpassword123" });

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);

            // Specifically check user timestamps
            if (response.body.user) {
              expect(response.body.user.createdAt).toMatch(ISO_8601_REGEX);
              expect(response.body.user.updatedAt).toMatch(ISO_8601_REGEX);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in ISO 8601 for get current user", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);

            // Specifically check user timestamps
            if (response.body.user) {
              expect(response.body.user.createdAt).toMatch(ISO_8601_REGEX);
              expect(response.body.user.updatedAt).toMatch(ISO_8601_REGEX);
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Site Management Endpoints", () => {
    it("should format timestamps in ISO 8601 for site creation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.webUrl(),
          async (name, url) => {
            const response = await request(app)
              .post("/api/sites")
              .set("Authorization", `Bearer ${authToken}`)
              .send({ name, url });

            if (response.status === 201) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check site timestamps
              if (response.body.site) {
                expect(response.body.site.createdAt).toMatch(ISO_8601_REGEX);
                expect(response.body.site.updatedAt).toMatch(ISO_8601_REGEX);

                // Clean up
                await prisma.site.delete({
                  where: { id: response.body.site.id },
                });
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should format timestamps in ISO 8601 for listing sites", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/sites")
            .set("Authorization", `Bearer ${token}`);

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);

            // Check each site in the array
            if (response.body.sites && Array.isArray(response.body.sites)) {
              response.body.sites.forEach((site: any) => {
                expect(site.createdAt).toMatch(ISO_8601_REGEX);
                expect(site.updatedAt).toMatch(ISO_8601_REGEX);
              });
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in ISO 8601 for getting site details", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testSite.siteId), async (siteId) => {
          const response = await request(app)
            .get(`/api/sites/${siteId}`)
            .set("Authorization", `Bearer ${authToken}`);

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);

            // Specifically check site timestamps
            if (response.body.site) {
              expect(response.body.site.createdAt).toMatch(ISO_8601_REGEX);
              expect(response.body.site.updatedAt).toMatch(ISO_8601_REGEX);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in ISO 8601 for updating a site", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.boolean(),
          async (name, isActive) => {
            const response = await request(app)
              .put(`/api/sites/${testSite.siteId}`)
              .set("Authorization", `Bearer ${authToken}`)
              .send({ name, isActive });

            if (response.status === 200) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check site timestamps
              if (response.body.site) {
                expect(response.body.site.createdAt).toMatch(ISO_8601_REGEX);
                expect(response.body.site.updatedAt).toMatch(ISO_8601_REGEX);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Metrics Endpoints", () => {
    it("should format timestamps in ISO 8601 for submitting metrics", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 1000, noNaN: true }),
          fc.double({ min: 0, max: 1, noNaN: true }),
          fc.constantFrom("desktop", "mobile", "tablet"),
          fc.constantFrom("chrome", "firefox", "safari", "edge"),
          async (lcp, fid, cls, deviceType, browserName) => {
            const response = await request(app)
              .post("/api/metrics")
              .set("X-Site-ID", testSite.siteId)
              .send({
                lcp,
                fid,
                cls,
                ttfb: 100,
                fcp: 200,
                tti: 300,
                deviceType,
                browserName,
                osName: "Windows",
              });

            if (response.status === 201) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check metric timestamp
              if (response.body.metric && response.body.metric.timestamp) {
                expect(response.body.metric.timestamp).toMatch(ISO_8601_REGEX);
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should format timestamps in ISO 8601 for getting metrics", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom("24h", "7d", "30d", undefined),
          async (timeRange) => {
            const url = timeRange
              ? `/api/metrics/${testSite.siteId}?timeRange=${timeRange}`
              : `/api/metrics/${testSite.siteId}`;

            const response = await request(app)
              .get(url)
              .set("Authorization", `Bearer ${authToken}`);

            if (response.status === 200) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Check each metric in the array
              if (response.body.metrics && Array.isArray(response.body.metrics)) {
                response.body.metrics.forEach((metric: any) => {
                  expect(metric.timestamp).toMatch(ISO_8601_REGEX);
                  // Metrics don't have createdAt, only timestamp
                });
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in ISO 8601 for metrics summary", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testSite.siteId), async (siteId) => {
          const response = await request(app)
            .get(`/api/metrics/${siteId}/summary`)
            .set("Authorization", `Bearer ${authToken}`);

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Alert Management Endpoints", () => {
    it("should format timestamps in ISO 8601 for creating alerts", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom("lcp", "fid", "cls"),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.constantFrom("greater_than", "less_than"),
          async (metricType, threshold, condition) => {
            const response = await request(app)
              .post("/api/alerts")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                siteId: testSite.siteId,
                metricType,
                threshold,
                condition,
              });

            if (response.status === 201) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check alert timestamps
              if (response.body.alert) {
                expect(response.body.alert.createdAt).toMatch(ISO_8601_REGEX);
                expect(response.body.alert.updatedAt).toMatch(ISO_8601_REGEX);

                // Clean up
                await prisma.alert.delete({
                  where: { id: response.body.alert.id },
                });
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should format timestamps in ISO 8601 for listing alerts", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/alerts")
            .set("Authorization", `Bearer ${token}`);

          if (response.status === 200) {
            // Property: All timestamps in response should be ISO 8601
            const invalidTimestamps = findInvalidTimestamps(response.body);
            expect(invalidTimestamps).toEqual([]);

            // Check each alert in the array
            if (response.body.alerts && Array.isArray(response.body.alerts)) {
              response.body.alerts.forEach((alert: any) => {
                expect(alert.createdAt).toMatch(ISO_8601_REGEX);
                expect(alert.updatedAt).toMatch(ISO_8601_REGEX);
              });
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should format timestamps in ISO 8601 for updating alerts", async () => {
      // First create an alert to update
      const alert = await prisma.alert.create({
        data: {
          userId: testUser.id,
          siteId: testSite.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
          isActive: true,
        },
      });

      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.boolean(),
          async (threshold, isActive) => {
            const response = await request(app)
              .put(`/api/alerts/${alert.id}`)
              .set("Authorization", `Bearer ${authToken}`)
              .send({ threshold, isActive });

            if (response.status === 200) {
              // Property: All timestamps in response should be ISO 8601
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);

              // Specifically check alert timestamps
              if (response.body.alert) {
                expect(response.body.alert.createdAt).toMatch(ISO_8601_REGEX);
                expect(response.body.alert.updatedAt).toMatch(ISO_8601_REGEX);
              }
            }
          }
        ),
        { numRuns: 50 }
      );

      // Clean up
      await prisma.alert.delete({ where: { id: alert.id } });
    });
  });

  describe("Cross-Endpoint Timestamp Consistency", () => {
    it("should use ISO 8601 format for all timestamp fields across all endpoints", async () => {
      // Test a variety of endpoints
      const endpoints = [
        {
          method: "GET",
          path: "/api/auth/me",
          auth: true,
        },
        {
          method: "GET",
          path: "/api/sites",
          auth: true,
        },
        {
          method: "GET",
          path: `/api/sites/${testSite.siteId}`,
          auth: true,
        },
        {
          method: "GET",
          path: `/api/metrics/${testSite.siteId}`,
          auth: true,
        },
        {
          method: "GET",
          path: `/api/metrics/${testSite.siteId}/summary`,
          auth: true,
        },
        {
          method: "GET",
          path: "/api/alerts",
          auth: true,
        },
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...endpoints),
          async (endpoint) => {
            let response;

            if (endpoint.auth) {
              response = await request(app)
                .get(endpoint.path)
                .set("Authorization", `Bearer ${authToken}`);
            } else {
              response = await request(app).get(endpoint.path);
            }

            if (response.status >= 200 && response.status < 300) {
              // Property: All timestamps should be ISO 8601 format
              const invalidTimestamps = findInvalidTimestamps(response.body);
              
              if (invalidTimestamps.length > 0) {
                console.error(
                  `Invalid timestamps found in ${endpoint.path}:`,
                  invalidTimestamps
                );
              }
              
              expect(invalidTimestamps).toEqual([]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should never return Date objects, only ISO 8601 strings", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/sites")
            .set("Authorization", `Bearer ${token}`);

          if (response.status === 200 && response.body.sites) {
            response.body.sites.forEach((site: any) => {
              // Property: Timestamps should be strings, not Date objects
              expect(typeof site.createdAt).toBe("string");
              expect(typeof site.updatedAt).toBe("string");
              expect(site.createdAt).not.toBeInstanceOf(Date);
              expect(site.updatedAt).not.toBeInstanceOf(Date);
            });
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should format timestamps consistently regardless of data volume", async () => {
      // Create multiple metrics to test with varying data volumes
      const metricsToCreate = [1, 5, 10, 20];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...metricsToCreate),
          async (count) => {
            // Create metrics
            const metrics = [];
            for (let i = 0; i < count; i++) {
              const metric = await prisma.metric.create({
                data: {
                  siteId: testSite.id,
                  lcp: Math.random() * 5000,
                  fid: Math.random() * 300,
                  cls: Math.random() * 0.5,
                  ttfb: Math.random() * 1000,
                  fcp: Math.random() * 3000,
                  tti: Math.random() * 5000,
                  deviceType: "desktop",
                  browserName: "chrome",
                  osName: "Windows",
                  timestamp: new Date(),
                },
              });
              metrics.push(metric);
            }

            const response = await request(app)
              .get(`/api/metrics/${testSite.siteId}`)
              .set("Authorization", `Bearer ${authToken}`);

            if (response.status === 200) {
              // Property: All timestamps should be ISO 8601 regardless of volume
              const invalidTimestamps = findInvalidTimestamps(response.body);
              expect(invalidTimestamps).toEqual([]);
            }

            // Clean up
            await prisma.metric.deleteMany({
              where: { id: { in: metrics.map((m) => m.id) } },
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
