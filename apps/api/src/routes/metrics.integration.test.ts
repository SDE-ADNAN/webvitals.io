/**
 * Integration tests for metrics endpoints
 * Tests the full HTTP request/response cycle for metrics endpoints
 * 
 * Requirements: 11.1-13.5
 */

import request from "supertest";
import express from "express";
import cors from "cors";
import { signToken } from "../utils/jwt";
import metricRoutes from "./metricRoutes";
import { testPrisma } from "../test-utils/database";
import { createTestUser, createTestSite, createTestMetric } from "../test-utils/factories";

describe("Metrics Endpoints - Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    // Create Express app with same configuration as main app
    app = express();

    // Configure CORS
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Site-ID"],
      })
    );

    // Body parser
    app.use(express.json());

    // Mount metric routes
    app.use("/api/metrics", metricRoutes);
  });

  describe("POST /api/metrics", () => {
    it("should submit a metric with valid data and X-Site-ID header", async () => {
      // Create a test user and site
      const user = await createTestUser({
        email: "metricsubmit@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id, {
        name: "Metric Test Site",
        url: "https://metrictest.com",
      });

      const metricData = {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 600,
        fcp: 1800,
        tti: 3800,
        deviceType: "desktop",
        browserName: "chrome",
        osName: "windows",
        pageUrl: "https://metrictest.com/page1",
      };

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(metricData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("metric");
      expect(response.body.metric).toHaveProperty("id");
      expect(response.body.metric).toHaveProperty("timestamp");

      // Verify metric was created in database
      const dbMetric = await testPrisma.metric.findUnique({
        where: { id: response.body.metric.id },
      });
      expect(dbMetric).toBeTruthy();
      expect(dbMetric?.lcp).toBe(metricData.lcp);
      expect(dbMetric?.fid).toBe(metricData.fid);
      expect(dbMetric?.cls).toBe(metricData.cls);
      expect(dbMetric?.deviceType).toBe(metricData.deviceType);
      expect(dbMetric?.browserName).toBe(metricData.browserName);
    });

    it("should submit a metric with only required fields", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const metricData = {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        deviceType: "mobile",
        browserName: "safari",
      };

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(metricData)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify in database
      const dbMetric = await testPrisma.metric.findUnique({
        where: { id: response.body.metric.id },
      });
      expect(dbMetric).toBeTruthy();
      expect(dbMetric?.ttfb).toBeNull();
      expect(dbMetric?.fcp).toBeNull();
      expect(dbMetric?.tti).toBeNull();
    });

    it("should return 401 when X-Site-ID header is missing", async () => {
      const metricData = {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      };

      const response = await request(app)
        .post("/api/metrics")
        .send(metricData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("X-Site-ID");
    });

    it("should return 401 when siteId does not exist", async () => {
      const metricData = {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      };

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", nonExistentSiteId)
        .send(metricData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Invalid site ID");
    });

    it("should return 400 for missing required fields", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const invalidData = {
        lcp: 2500,
        // Missing fid, cls, deviceType, browserName
      };

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for negative metric values", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const invalidData = {
        lcp: -100,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      };

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid metric types", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const invalidData = {
        lcp: "not-a-number",
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      };

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });
  });


  describe("GET /api/metrics/:siteId", () => {
    it("should retrieve metrics for owned site", async () => {
      // Create a test user and site
      const user = await createTestUser({
        email: "metricsget@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id, {
        name: "Metrics Get Site",
        url: "https://metricsget.com",
      });

      // Create some metrics
      await createTestMetric(site.id, {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      });
      await createTestMetric(site.id, {
        lcp: 3000,
        fid: 150,
        cls: 0.2,
        deviceType: "mobile",
        browserName: "safari",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("metrics");
      expect(Array.isArray(response.body.metrics)).toBe(true);
      expect(response.body.metrics.length).toBeGreaterThanOrEqual(2);

      // Verify metric properties
      response.body.metrics.forEach((metric: any) => {
        expect(metric).toHaveProperty("id");
        expect(metric).toHaveProperty("lcp");
        expect(metric).toHaveProperty("fid");
        expect(metric).toHaveProperty("cls");
        expect(metric).toHaveProperty("deviceType");
        expect(metric).toHaveProperty("browserName");
        expect(metric).toHaveProperty("timestamp");
      });
    });

    it("should filter metrics by timeRange (24h)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create a recent metric (within 24h)
      await createTestMetric(site.id, {
        timestamp: new Date(),
      });

      // Create an old metric (older than 24h)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2);
      await createTestMetric(site.id, {
        timestamp: oldDate,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ timeRange: "24h" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return the recent metric
      expect(response.body.metrics.length).toBe(1);
    });

    it("should filter metrics by timeRange (7d)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create a recent metric (within 7 days)
      await createTestMetric(site.id, {
        timestamp: new Date(),
      });

      // Create an old metric (older than 7 days)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      await createTestMetric(site.id, {
        timestamp: oldDate,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ timeRange: "7d" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return the recent metric
      expect(response.body.metrics.length).toBe(1);
    });

    it("should filter metrics by timeRange (30d)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create a recent metric (within 30 days)
      await createTestMetric(site.id, {
        timestamp: new Date(),
      });

      // Create an old metric (older than 30 days)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      await createTestMetric(site.id, {
        timestamp: oldDate,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ timeRange: "30d" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return the recent metric
      expect(response.body.metrics.length).toBe(1);
    });

    it("should filter metrics by deviceType", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create metrics with different device types
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "chrome",
      });
      await createTestMetric(site.id, {
        deviceType: "mobile",
        browserName: "safari",
      });
      await createTestMetric(site.id, {
        deviceType: "tablet",
        browserName: "firefox",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ deviceType: "mobile" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return mobile metrics
      expect(response.body.metrics.length).toBe(1);
      expect(response.body.metrics[0].deviceType).toBe("mobile");
    });

    it("should filter metrics by browserName", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create metrics with different browsers
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "chrome",
      });
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "firefox",
      });
      await createTestMetric(site.id, {
        deviceType: "mobile",
        browserName: "safari",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ browserName: "chrome" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return chrome metrics
      expect(response.body.metrics.length).toBe(1);
      expect(response.body.metrics[0].browserName).toBe("chrome");
    });

    it("should filter metrics by multiple criteria", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create metrics with different combinations
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "chrome",
        timestamp: new Date(),
      });
      await createTestMetric(site.id, {
        deviceType: "mobile",
        browserName: "chrome",
        timestamp: new Date(),
      });
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "firefox",
        timestamp: new Date(),
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ 
          deviceType: "desktop",
          browserName: "chrome",
          timeRange: "24h"
        })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only return desktop chrome metrics
      expect(response.body.metrics.length).toBe(1);
      expect(response.body.metrics[0].deviceType).toBe("desktop");
      expect(response.body.metrics[0].browserName).toBe("chrome");
    });

    it("should return empty array when no metrics match filters", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create a metric with specific device type
      await createTestMetric(site.id, {
        deviceType: "desktop",
        browserName: "chrome",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ deviceType: "tablet" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.metrics).toEqual([]);
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/metrics/${nonExistentSiteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 403 when user does not own the site", async () => {
      const user1 = await createTestUser({
        email: "owner@example.com",
      });
      const user2 = await createTestUser({
        email: "notowner@example.com",
      });

      const site = await createTestSite(user1.id);

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");
    });
  });


  describe("GET /api/metrics/:siteId/summary", () => {
    it("should calculate summary statistics for metrics", async () => {
      const user = await createTestUser({
        email: "summary@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id);

      // Create metrics with known values
      await createTestMetric(site.id, {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
      });
      await createTestMetric(site.id, {
        lcp: 3000,
        fid: 150,
        cls: 0.2,
      });
      await createTestMetric(site.id, {
        lcp: 4000,
        fid: 200,
        cls: 0.3,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("summary");
      expect(response.body.summary).toHaveProperty("count");
      expect(response.body.summary).toHaveProperty("averages");
      expect(response.body.summary).toHaveProperty("p95");

      // Verify count
      expect(response.body.summary.count).toBe(3);

      // Verify averages
      expect(response.body.summary.averages).toHaveProperty("lcp");
      expect(response.body.summary.averages).toHaveProperty("fid");
      expect(response.body.summary.averages).toHaveProperty("cls");
      expect(response.body.summary.averages.lcp).toBe(3000); // (2000 + 3000 + 4000) / 3
      expect(response.body.summary.averages.fid).toBe(150); // (100 + 150 + 200) / 3
      expect(response.body.summary.averages.cls).toBeCloseTo(0.2, 1); // (0.1 + 0.2 + 0.3) / 3

      // Verify p95
      expect(response.body.summary.p95).toHaveProperty("lcp");
      expect(response.body.summary.p95).toHaveProperty("fid");
      expect(response.body.summary.p95).toHaveProperty("cls");
    });

    it("should calculate p95 correctly", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create 100 metrics with values from 1 to 100
      for (let i = 1; i <= 100; i++) {
        await createTestMetric(site.id, {
          lcp: i * 100,
          fid: i * 10,
          cls: i * 0.01,
        });
      }

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // p95 should be the 95th value
      expect(response.body.summary.p95.lcp).toBe(9500); // 95 * 100
      expect(response.body.summary.p95.fid).toBe(950); // 95 * 10
      expect(response.body.summary.p95.cls).toBeCloseTo(0.95, 2); // 95 * 0.01
    });

    it("should return zero values when no metrics exist", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.summary.count).toBe(0);
      expect(response.body.summary.averages.lcp).toBe(0);
      expect(response.body.summary.averages.fid).toBe(0);
      expect(response.body.summary.averages.cls).toBe(0);
      expect(response.body.summary.p95.lcp).toBe(0);
      expect(response.body.summary.p95.fid).toBe(0);
      expect(response.body.summary.p95.cls).toBe(0);
    });

    it("should calculate summary only for filtered data (timeRange)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create a recent metric
      await createTestMetric(site.id, {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
        timestamp: new Date(),
      });

      // Create an old metric (older than 24h)
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2);
      await createTestMetric(site.id, {
        lcp: 5000,
        fid: 500,
        cls: 0.5,
        timestamp: oldDate,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .query({ timeRange: "24h" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only include the recent metric
      expect(response.body.summary.count).toBe(1);
      expect(response.body.summary.averages.lcp).toBe(2000);
      expect(response.body.summary.averages.fid).toBe(100);
    });

    it("should calculate summary only for filtered data (deviceType)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create desktop metrics
      await createTestMetric(site.id, {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
      });
      await createTestMetric(site.id, {
        lcp: 3000,
        fid: 150,
        cls: 0.2,
        deviceType: "desktop",
      });

      // Create mobile metric
      await createTestMetric(site.id, {
        lcp: 5000,
        fid: 500,
        cls: 0.5,
        deviceType: "mobile",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .query({ deviceType: "desktop" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only include desktop metrics
      expect(response.body.summary.count).toBe(2);
      expect(response.body.summary.averages.lcp).toBe(2500); // (2000 + 3000) / 2
      expect(response.body.summary.averages.fid).toBe(125); // (100 + 150) / 2
    });

    it("should calculate summary only for filtered data (browserName)", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create chrome metrics
      await createTestMetric(site.id, {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
        browserName: "chrome",
      });
      await createTestMetric(site.id, {
        lcp: 3000,
        fid: 150,
        cls: 0.2,
        browserName: "chrome",
      });

      // Create firefox metric
      await createTestMetric(site.id, {
        lcp: 5000,
        fid: 500,
        cls: 0.5,
        browserName: "firefox",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .query({ browserName: "chrome" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Should only include chrome metrics
      expect(response.body.summary.count).toBe(2);
      expect(response.body.summary.averages.lcp).toBe(2500);
      expect(response.body.summary.averages.fid).toBe(125);
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/metrics/${nonExistentSiteId}/summary`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 403 when user does not own the site", async () => {
      const user1 = await createTestUser({
        email: "owner@example.com",
      });
      const user2 = await createTestUser({
        email: "notowner@example.com",
      });

      const site = await createTestSite(user1.id);

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");
    });
  });


  describe("Integration: Full metrics flow", () => {
    it("should complete submit -> retrieve -> summary flow", async () => {
      const user = await createTestUser({
        email: "fullflow@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id, {
        name: "Flow Test Site",
        url: "https://flowtest.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Step 1: Submit multiple metrics
      const metricData1 = {
        lcp: 2000,
        fid: 100,
        cls: 0.1,
        deviceType: "desktop",
        browserName: "chrome",
      };

      const metricData2 = {
        lcp: 3000,
        fid: 150,
        cls: 0.2,
        deviceType: "mobile",
        browserName: "safari",
      };

      await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(metricData1)
        .expect(201);

      await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send(metricData2)
        .expect(201);

      // Step 2: Retrieve all metrics
      const listResponse = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(listResponse.body.metrics.length).toBeGreaterThanOrEqual(2);

      // Step 3: Retrieve filtered metrics (desktop only)
      const filteredResponse = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .query({ deviceType: "desktop" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(filteredResponse.body.metrics.length).toBeGreaterThanOrEqual(1);
      expect(filteredResponse.body.metrics[0].deviceType).toBe("desktop");

      // Step 4: Get summary statistics
      const summaryResponse = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(summaryResponse.body.summary.count).toBeGreaterThanOrEqual(2);
      expect(summaryResponse.body.summary.averages.lcp).toBeGreaterThan(0);
      expect(summaryResponse.body.summary.p95.lcp).toBeGreaterThan(0);

      // Step 5: Get filtered summary (desktop only)
      const filteredSummaryResponse = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .query({ deviceType: "desktop" })
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(filteredSummaryResponse.body.summary.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Response format consistency", () => {
    it("should return consistent error format for all metrics endpoints", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Submit without X-Site-ID
      const submitResponse = await request(app)
        .post("/api/metrics")
        .send({
          lcp: 2000,
          fid: 100,
          cls: 0.1,
          deviceType: "desktop",
          browserName: "chrome",
        })
        .expect(401);

      expect(submitResponse.body).toHaveProperty("error");
      expect(submitResponse.body).toHaveProperty("message");

      // Get metrics without auth
      const getResponse = await request(app)
        .get("/api/metrics/00000000-0000-0000-0000-000000000000")
        .expect(401);

      expect(getResponse.body).toHaveProperty("error");
      expect(getResponse.body).toHaveProperty("message");

      // Get summary without auth
      const summaryResponse = await request(app)
        .get("/api/metrics/00000000-0000-0000-0000-000000000000/summary")
        .expect(401);

      expect(summaryResponse.body).toHaveProperty("error");
      expect(summaryResponse.body).toHaveProperty("message");
    });

    it("should return JSON content type for all responses", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Submit
      const submitResponse = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send({
          lcp: 2000,
          fid: 100,
          cls: 0.1,
          deviceType: "desktop",
          browserName: "chrome",
        });

      expect(submitResponse.headers["content-type"]).toMatch(/application\/json/);

      // Get metrics
      const getResponse = await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getResponse.headers["content-type"]).toMatch(/application\/json/);

      // Get summary
      const summaryResponse = await request(app)
        .get(`/api/metrics/${site.siteId}/summary`)
        .set("Authorization", `Bearer ${token}`);

      expect(summaryResponse.headers["content-type"]).toMatch(/application\/json/);
    });
  });

  describe("Authentication and Authorization", () => {
    it("should allow metric submission with valid X-Site-ID", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .post("/api/metrics")
        .set("X-Site-ID", site.siteId)
        .send({
          lcp: 2000,
          fid: 100,
          cls: 0.1,
          deviceType: "desktop",
          browserName: "chrome",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it("should require authentication for metrics retrieval", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Without token
      await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .expect(401);

      // With valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      await request(app)
        .get(`/api/metrics/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should enforce ownership for metrics retrieval", async () => {
      const user1 = await createTestUser({
        email: "user1@example.com",
      });
      const user2 = await createTestUser({
        email: "user2@example.com",
      });

      const site1 = await createTestSite(user1.id);

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      // User2 should not be able to access User1's metrics
      await request(app)
        .get(`/api/metrics/${site1.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);
    });
  });
});
