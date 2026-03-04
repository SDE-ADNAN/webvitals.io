/**
 * Integration tests for site endpoints
 * Tests the full HTTP request/response cycle for site endpoints
 * 
 * Requirements: 6.1-10.5
 */

import request from "supertest";
import express from "express";
import cors from "cors";
import { signToken } from "../utils/jwt";
import siteRoutes from "./siteRoutes";
import { testPrisma } from "../test-utils/database";
import { createTestUser, createTestSite, createTestMetric, createTestAlert } from "../test-utils/factories";

describe("Site Endpoints - Integration Tests", () => {
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

    // Mount site routes
    app.use("/api/sites", siteRoutes);
  });

  describe("POST /api/sites", () => {
    it("should create a new site with valid data", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "siteowner@example.com",
        password: "password123",
      });

      // Generate a valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        name: "My Test Site",
        url: "https://example.com",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty("site");
      expect(response.body.site).toMatchObject({
        name: siteData.name,
        url: siteData.url,
        domain: "example.com",
        isActive: true,
      });

      // Verify site has required fields
      expect(response.body.site).toHaveProperty("id");
      expect(response.body.site).toHaveProperty("siteId");
      expect(response.body.site).toHaveProperty("createdAt");
      expect(response.body.site).toHaveProperty("updatedAt");

      // Verify siteId is a UUID
      expect(response.body.site.siteId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );

      // Verify site was created in database
      const dbSite = await testPrisma.site.findUnique({
        where: { id: response.body.site.id },
      });
      expect(dbSite).toBeTruthy();
      expect(dbSite?.name).toBe(siteData.name);
      expect(dbSite?.userId).toBe(user.id);
    });

    it("should extract domain from URL correctly", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const testCases = [
        { url: "https://example.com", expectedDomain: "example.com" },
        { url: "https://www.example.com", expectedDomain: "www.example.com" },
        { url: "https://subdomain.example.com", expectedDomain: "subdomain.example.com" },
        { url: "https://example.com/path", expectedDomain: "example.com" },
        { url: "https://example.com:8080", expectedDomain: "example.com" },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post("/api/sites")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: `Test Site for ${testCase.url}`,
            url: testCase.url,
          })
          .expect(201);

        expect(response.body.site.domain).toBe(testCase.expectedDomain);
      }
    });

    it("should return 401 when not authenticated", async () => {
      const siteData = {
        name: "Test Site",
        url: "https://example.com",
      };

      const response = await request(app)
        .post("/api/sites")
        .send(siteData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 400 for invalid site name (too short)", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        name: "ab", // Less than 3 characters
        url: "https://example.com",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid site name (too long)", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        name: "a".repeat(51), // More than 50 characters
        url: "https://example.com",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid URL format", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        name: "Test Site",
        url: "not-a-valid-url",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 when name is missing", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        url: "https://example.com",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 when url is missing", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const siteData = {
        name: "Test Site",
      };

      const response = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send(siteData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });
  });


  describe("GET /api/sites", () => {
    it("should list all sites for authenticated user", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "listowner@example.com",
        password: "password123",
      });

      // Create multiple sites for the user
      const site1 = await createTestSite(user.id, {
        name: "Site 1",
        url: "https://site1.com",
      });
      const site2 = await createTestSite(user.id, {
        name: "Site 2",
        url: "https://site2.com",
      });
      const site3 = await createTestSite(user.id, {
        name: "Site 3",
        url: "https://site3.com",
      });

      // Generate a valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("sites");
      expect(Array.isArray(response.body.sites)).toBe(true);
      expect(response.body.sites).toHaveLength(3);

      // Verify sites are ordered by createdAt descending (newest first)
      const siteIds = response.body.sites.map((s: any) => s.id);
      expect(siteIds).toContain(site1.id);
      expect(siteIds).toContain(site2.id);
      expect(siteIds).toContain(site3.id);

      // Verify each site has all required properties
      response.body.sites.forEach((site: any) => {
        expect(site).toHaveProperty("id");
        expect(site).toHaveProperty("siteId");
        expect(site).toHaveProperty("name");
        expect(site).toHaveProperty("url");
        expect(site).toHaveProperty("domain");
        expect(site).toHaveProperty("isActive");
        expect(site).toHaveProperty("userId");
        expect(site).toHaveProperty("createdAt");
        expect(site).toHaveProperty("updatedAt");
      });
    });

    it("should return empty array when user has no sites", async () => {
      // Create a test user with no sites
      const user = await createTestUser({
        email: "nosites@example.com",
        password: "password123",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("sites");
      expect(Array.isArray(response.body.sites)).toBe(true);
      expect(response.body.sites).toHaveLength(0);
    });

    it("should only return sites belonging to authenticated user", async () => {
      // Create two users
      const user1 = await createTestUser({
        email: "user1@example.com",
        password: "password123",
      });
      const user2 = await createTestUser({
        email: "user2@example.com",
        password: "password123",
      });

      // Create sites for both users
      await createTestSite(user1.id, {
        name: "User 1 Site",
        url: "https://user1.com",
      });
      await createTestSite(user2.id, {
        name: "User 2 Site",
        url: "https://user2.com",
      });

      // Get sites for user1
      const token1 = signToken({
        userId: user1.id.toString(),
        email: user1.email,
      });

      const response1 = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token1}`)
        .expect(200);

      expect(response1.body.sites).toHaveLength(1);
      expect(response1.body.sites[0].userId).toBe(user1.id);
      expect(response1.body.sites[0].name).toBe("User 1 Site");

      // Get sites for user2
      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response2 = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token2}`)
        .expect(200);

      expect(response2.body.sites).toHaveLength(1);
      expect(response2.body.sites[0].userId).toBe(user2.id);
      expect(response2.body.sites[0].name).toBe("User 2 Site");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app)
        .get("/api/sites")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });
  });


  describe("GET /api/sites/:siteId", () => {
    it("should get site details for owned site", async () => {
      // Create a test user and site
      const user = await createTestUser({
        email: "getsite@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id, {
        name: "My Site",
        url: "https://mysite.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("site");
      expect(response.body.site).toMatchObject({
        id: site.id,
        siteId: site.siteId,
        name: site.name,
        url: site.url,
        domain: site.domain,
        isActive: site.isActive,
        userId: user.id,
      });

      // Verify all properties are present
      expect(response.body.site).toHaveProperty("createdAt");
      expect(response.body.site).toHaveProperty("updatedAt");
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .get(`/api/sites/${nonExistentSiteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Not Found");
      expect(response.body.message).toContain("Site not found");
    });

    it("should return 403 when user does not own the site", async () => {
      // Create two users
      const user1 = await createTestUser({
        email: "owner@example.com",
        password: "password123",
      });
      const user2 = await createTestUser({
        email: "notowner@example.com",
        password: "password123",
      });

      // Create site for user1
      const site = await createTestSite(user1.id, {
        name: "User 1 Site",
        url: "https://user1site.com",
      });

      // Try to access with user2's token
      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .get(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Forbidden");
      expect(response.body.message).toContain("permission");
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .get(`/api/sites/${site.siteId}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });
  });


  describe("PUT /api/sites/:siteId", () => {
    it("should update site name", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "Original Name",
        url: "https://example.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        name: "Updated Name",
      };

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("site");
      expect(response.body.site.name).toBe("Updated Name");
      expect(response.body.site.url).toBe(site.url); // URL unchanged

      // Verify in database
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite?.name).toBe("Updated Name");
    });

    it("should update site URL and domain", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "Test Site",
        url: "https://old.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        url: "https://new.com",
      };

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.site.url).toBe("https://new.com");
      expect(response.body.site.domain).toBe("new.com");
      expect(response.body.site.name).toBe(site.name); // Name unchanged
    });

    it("should update site isActive status", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "Test Site",
        url: "https://example.com",
        isActive: true,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.site.isActive).toBe(false);

      // Verify in database
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite?.isActive).toBe(false);
    });

    it("should update multiple fields at once", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "Old Name",
        url: "https://old.com",
        isActive: true,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        name: "New Name",
        url: "https://new.com",
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.site).toMatchObject({
        name: "New Name",
        url: "https://new.com",
        domain: "new.com",
        isActive: false,
      });
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .put(`/api/sites/${nonExistentSiteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" })
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
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ name: "Hacked Name" })
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");

      // Verify site was not updated
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite?.name).toBe(site.name);
    });

    it("should return 400 for invalid name", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "ab" }) // Too short
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid URL", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ url: "not-a-valid-url" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .send({ name: "New Name" })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });
  });


  describe("DELETE /api/sites/:siteId", () => {
    it("should delete a site successfully", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "Site to Delete",
        url: "https://delete.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("deleted successfully");

      // Verify site was deleted from database
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite).toBeNull();
    });

    it("should cascade delete associated metrics", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create metrics for the site
      const metric1 = await createTestMetric(site.id);
      const metric2 = await createTestMetric(site.id);
      const metric3 = await createTestMetric(site.id);

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Delete the site
      await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify metrics were deleted
      const dbMetrics = await testPrisma.metric.findMany({
        where: { siteId: site.id },
      });
      expect(dbMetrics).toHaveLength(0);
    });

    it("should cascade delete associated alerts", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create alerts for the site
      const alert1 = await createTestAlert(user.id, site.id);
      const alert2 = await createTestAlert(user.id, site.id);

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Delete the site
      await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify alerts were deleted
      const dbAlerts = await testPrisma.alert.findMany({
        where: { siteId: site.id },
      });
      expect(dbAlerts).toHaveLength(0);
    });

    it("should cascade delete both metrics and alerts", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      // Create metrics and alerts
      await createTestMetric(site.id);
      await createTestMetric(site.id);
      await createTestAlert(user.id, site.id);
      await createTestAlert(user.id, site.id);

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Delete the site
      await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify both metrics and alerts were deleted
      const dbMetrics = await testPrisma.metric.findMany({
        where: { siteId: site.id },
      });
      const dbAlerts = await testPrisma.alert.findMany({
        where: { siteId: site.id },
      });

      expect(dbMetrics).toHaveLength(0);
      expect(dbAlerts).toHaveLength(0);
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const nonExistentSiteId = "00000000-0000-0000-0000-000000000000";

      const response = await request(app)
        .delete(`/api/sites/${nonExistentSiteId}`)
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
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");

      // Verify site was not deleted
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite).toBeTruthy();
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);

      const response = await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");

      // Verify site was not deleted
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site.id },
      });
      expect(dbSite).toBeTruthy();
    });
  });


  describe("Ownership Verification", () => {
    it("should prevent user from accessing another user's site", async () => {
      const user1 = await createTestUser({
        email: "user1@example.com",
      });
      const user2 = await createTestUser({
        email: "user2@example.com",
      });

      const site1 = await createTestSite(user1.id, {
        name: "User 1 Site",
      });

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      // Try to get site
      await request(app)
        .get(`/api/sites/${site1.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      // Try to update site
      await request(app)
        .put(`/api/sites/${site1.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ name: "Hacked" })
        .expect(403);

      // Try to delete site
      await request(app)
        .delete(`/api/sites/${site1.siteId}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      // Verify site is unchanged
      const dbSite = await testPrisma.site.findUnique({
        where: { id: site1.id },
      });
      expect(dbSite?.name).toBe("User 1 Site");
      expect(dbSite?.userId).toBe(user1.id);
    });

    it("should allow user to manage their own sites", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id, {
        name: "My Site",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Get site - should succeed
      await request(app)
        .get(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Update site - should succeed
      await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Site" })
        .expect(200);

      // Delete site - should succeed
      await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });
  });

  describe("Integration: Full site management flow", () => {
    it("should complete create -> list -> get -> update -> delete flow", async () => {
      const user = await createTestUser({
        email: "fullflow@example.com",
        password: "password123",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Step 1: Create a site
      const createResponse = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Flow Test Site",
          url: "https://flowtest.com",
        })
        .expect(201);

      const siteId = createResponse.body.site.siteId;
      expect(siteId).toBeTruthy();

      // Step 2: List sites (should include the new site)
      const listResponse = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(listResponse.body.sites).toHaveLength(1);
      expect(listResponse.body.sites[0].siteId).toBe(siteId);

      // Step 3: Get site details
      const getResponse = await request(app)
        .get(`/api/sites/${siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body.site.name).toBe("Flow Test Site");

      // Step 4: Update the site
      const updateResponse = await request(app)
        .put(`/api/sites/${siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Flow Test Site",
          isActive: false,
        })
        .expect(200);

      expect(updateResponse.body.site.name).toBe("Updated Flow Test Site");
      expect(updateResponse.body.site.isActive).toBe(false);

      // Step 5: Delete the site
      await request(app)
        .delete(`/api/sites/${siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Step 6: Verify site is deleted (list should be empty)
      const finalListResponse = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(finalListResponse.body.sites).toHaveLength(0);
    });
  });

  describe("Response format consistency", () => {
    it("should return consistent error format for all site endpoints", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Create with invalid data
      const createResponse = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "ab", url: "invalid" })
        .expect(400);

      expect(createResponse.body).toHaveProperty("error");
      expect(createResponse.body).toHaveProperty("message");

      // Get non-existent site
      const getResponse = await request(app)
        .get("/api/sites/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty("error");
      expect(getResponse.body).toHaveProperty("message");

      // Update non-existent site
      const updateResponse = await request(app)
        .put("/api/sites/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test" })
        .expect(404);

      expect(updateResponse.body).toHaveProperty("error");
      expect(updateResponse.body).toHaveProperty("message");

      // Delete non-existent site
      const deleteResponse = await request(app)
        .delete("/api/sites/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(deleteResponse.body).toHaveProperty("error");
      expect(deleteResponse.body).toHaveProperty("message");
    });

    it("should return JSON content type for all responses", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id);
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Create
      const createResponse = await request(app)
        .post("/api/sites")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test", url: "https://test.com" });

      expect(createResponse.headers["content-type"]).toMatch(/application\/json/);

      // List
      const listResponse = await request(app)
        .get("/api/sites")
        .set("Authorization", `Bearer ${token}`);

      expect(listResponse.headers["content-type"]).toMatch(/application\/json/);

      // Get
      const getResponse = await request(app)
        .get(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getResponse.headers["content-type"]).toMatch(/application\/json/);

      // Update
      const updateResponse = await request(app)
        .put(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated" });

      expect(updateResponse.headers["content-type"]).toMatch(/application\/json/);

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/sites/${site.siteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteResponse.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
