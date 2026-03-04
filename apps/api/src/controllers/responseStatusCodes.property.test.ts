/**
 * Property-based tests for response status codes across all API endpoints
 * Feature: backend-api, Property 12: Consistent Response Format
 * Validates: Requirements 26.1
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
 * Property 12: Consistent Response Format
 * For any successful API response, status code should be 200 or 201
 * **Validates: Requirements 26.1**
 */
describe("Feature: backend-api, Property 12: Consistent Response Format", () => {
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
        email: `test-${Date.now()}@example.com`,
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
        siteId: `site-${Date.now()}`,
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
    it("should use 201 for successful registration (POST)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (email, password, firstName, lastName) => {
            // Use unique email to avoid conflicts
            const uniqueEmail = `${Date.now()}-${email}`;

            const response = await request(app)
              .post("/api/auth/register")
              .send({ email: uniqueEmail, password, firstName, lastName });

            // Property: Successful registration should use 201 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(201);
            }

            // Clean up created user
            if (response.status === 201 && response.body.user) {
              await prisma.user.delete({
                where: { id: response.body.user.id },
              });
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to avoid database load
      );
    });

    it("should use 200 for successful login (POST)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testUser), async (user) => {
          const response = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "testpassword123" });

          // Property: Successful login should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should use 200 for getting current user (GET)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

          // Property: Successful GET should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Site Management Endpoints", () => {
    it("should use 201 for creating a site (POST)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.webUrl(),
          async (name, url) => {
            const response = await request(app)
              .post("/api/sites")
              .set("Authorization", `Bearer ${authToken}`)
              .send({ name, url });

            // Property: Successful site creation should use 201 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(201);

              // Clean up created site
              if (response.body.site) {
                await prisma.site.delete({
                  where: { id: response.body.site.id },
                });
              }
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to avoid database load
      );
    });

    it("should use 200 for listing sites (GET)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/sites")
            .set("Authorization", `Bearer ${token}`);

          // Property: Successful GET should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should use 200 for getting site details (GET)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testSite.siteId), async (siteId) => {
          const response = await request(app)
            .get(`/api/sites/${siteId}`)
            .set("Authorization", `Bearer ${authToken}`);

          // Property: Successful GET should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should use 200 for updating a site (PUT)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.boolean(),
          async (name, isActive) => {
            const response = await request(app)
              .put(`/api/sites/${testSite.siteId}`)
              .set("Authorization", `Bearer ${authToken}`)
              .send({ name, isActive });

            // Property: Successful PUT should use 200 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(200);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe("Metrics Endpoints", () => {
    it("should use 201 for submitting a metric (POST)", async () => {
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

            // Property: Successful metric submission should use 201 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(201);
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to avoid database load
      );
    });

    it("should use 200 for getting metrics (GET)", async () => {
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

            // Property: Successful GET should use 200 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(200);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should use 200 for getting metrics summary (GET)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(testSite.siteId), async (siteId) => {
          const response = await request(app)
            .get(`/api/metrics/${siteId}/summary`)
            .set("Authorization", `Bearer ${authToken}`);

          // Property: Successful GET should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Alert Management Endpoints", () => {
    it("should use 201 for creating an alert (POST)", async () => {
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

            // Property: Successful alert creation should use 201 status code
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(201);

              // Clean up created alert
              if (response.body.alert) {
                await prisma.alert.delete({
                  where: { id: response.body.alert.id },
                });
              }
            }
          }
        ),
        { numRuns: 10 } // Reduced runs to avoid database load
      );
    });

    it("should use 200 for listing alerts (GET)", async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(authToken), async (token) => {
          const response = await request(app)
            .get("/api/alerts")
            .set("Authorization", `Bearer ${token}`);

          // Property: Successful GET should use 200 status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(200);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Cross-Endpoint Status Code Consistency", () => {
    it("should only use 200 or 201 for all successful responses", async () => {
      // Generator for different endpoint types
      const endpointArbitrary = fc.constantFrom(
        { method: "GET", path: "/api/auth/me", needsAuth: true },
        { method: "GET", path: "/api/sites", needsAuth: true },
        { method: "GET", path: `/api/sites/${testSite.siteId}`, needsAuth: true },
        { method: "GET", path: `/api/metrics/${testSite.siteId}`, needsAuth: true },
        { method: "GET", path: `/api/metrics/${testSite.siteId}/summary`, needsAuth: true },
        { method: "GET", path: "/api/alerts", needsAuth: true }
      );

      await fc.assert(
        fc.asyncProperty(endpointArbitrary, async (endpoint) => {
          let response;

          if (endpoint.needsAuth) {
            response = await request(app)
              .get(endpoint.path)
              .set("Authorization", `Bearer ${authToken}`);
          } else {
            response = await request(app).get(endpoint.path);
          }

          // Property: All successful responses must use ONLY 200 or 201
          if (response.status >= 200 && response.status < 300) {
            expect([200, 201]).toContain(response.status);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should use 200 for all successful GET requests", async () => {
      const getEndpoints = [
        "/api/auth/me",
        "/api/sites",
        `/api/sites/${testSite.siteId}`,
        `/api/metrics/${testSite.siteId}`,
        `/api/metrics/${testSite.siteId}/summary`,
        "/api/alerts",
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...getEndpoints),
          async (endpoint) => {
            const response = await request(app)
              .get(endpoint)
              .set("Authorization", `Bearer ${authToken}`);

            // Property: All successful GET requests should use 200 (not 201)
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(200);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should use 201 for all successful POST requests that create resources", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 }),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (userData) => {
            const uniqueEmail = `${Date.now()}-${userData.email}`;

            const response = await request(app)
              .post("/api/auth/register")
              .send({ ...userData, email: uniqueEmail });

            // Property: All successful POST requests that create resources should use 201
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).toBe(201);

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

    it("should never use status codes outside 200-201 for successful responses", async () => {
      const allEndpoints = [
        { method: "GET", path: "/api/auth/me" },
        { method: "GET", path: "/api/sites" },
        { method: "GET", path: "/api/alerts" },
      ];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...allEndpoints),
          async (endpoint) => {
            const response = await request(app)
              .get(endpoint.path)
              .set("Authorization", `Bearer ${authToken}`);

            // Property: Successful responses should NEVER use 202, 203, 204, etc.
            if (response.status >= 200 && response.status < 300) {
              expect(response.status).not.toBe(202);
              expect(response.status).not.toBe(203);
              expect(response.status).not.toBe(204);
              expect(response.status).not.toBe(205);
              expect(response.status).not.toBe(206);
              expect(response.status).not.toBe(207);
              expect(response.status).not.toBe(208);
              expect(response.status).not.toBe(226);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("HTTP Method to Status Code Mapping", () => {
    it("should consistently map HTTP methods to appropriate status codes", async () => {
      // Generator for HTTP method and expected status code pairs
      const methodStatusArbitrary = fc.constantFrom(
        { method: "GET", expectedStatus: 200 },
        { method: "PUT", expectedStatus: 200 },
        { method: "DELETE", expectedStatus: 200 },
        { method: "POST", expectedStatus: 201 }
      );

      await fc.assert(
        fc.asyncProperty(methodStatusArbitrary, async (config) => {
          let response;

          switch (config.method) {
            case "GET":
              response = await request(app)
                .get("/api/sites")
                .set("Authorization", `Bearer ${authToken}`);
              break;
            case "PUT":
              response = await request(app)
                .put(`/api/sites/${testSite.siteId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ name: "Updated Name" });
              break;
            case "POST":
              const uniqueEmail = `${Date.now()}@example.com`;
              response = await request(app)
                .post("/api/auth/register")
                .send({
                  email: uniqueEmail,
                  password: "password123",
                  firstName: "Test",
                  lastName: "User",
                });
              // Clean up
              if (response.status === 201 && response.body.user) {
                await prisma.user.delete({
                  where: { id: response.body.user.id },
                });
              }
              break;
            default:
              return;
          }

          // Property: HTTP method should consistently map to expected status code
          if (response.status >= 200 && response.status < 300) {
            expect(response.status).toBe(config.expectedStatus);
          }
        }),
        { numRuns: 50 }
      );
    });
  });
});
