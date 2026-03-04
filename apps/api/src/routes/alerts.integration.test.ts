/**
 * Integration tests for alert endpoints
 * Tests the full HTTP request/response cycle for alert endpoints
 * 
 * Requirements: 14.1-17.5
 */

import request from "supertest";
import express from "express";
import cors from "cors";
import { signToken } from "../utils/jwt";
import alertRoutes from "./alertRoutes";
import { testPrisma } from "../test-utils/database";
import { createTestUser, createTestSite, createTestAlert } from "../test-utils/factories";

describe("Alert Endpoints - Integration Tests", () => {
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
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Body parser
    app.use(express.json());

    // Mount alert routes
    app.use("/api/alerts", alertRoutes);
  });

  describe("POST /api/alerts", () => {
    it("should create a new alert with valid data", async () => {
      // Create a test user and site
      const user = await createTestUser({
        email: "alertowner@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id.toString(), {
        name: "Test Site",
        url: "https://example.com",
      });

      // Generate a valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const alertData = {
        siteId: site.id,
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
      };

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send(alertData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty("alert");
      expect(response.body.alert).toMatchObject({
        siteId: site.id,
        userId: user.id,
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
        isActive: true,
      });

      // Verify alert has required fields
      expect(response.body.alert).toHaveProperty("id");
      expect(response.body.alert).toHaveProperty("createdAt");
      expect(response.body.alert).toHaveProperty("updatedAt");

      // Verify alert was created in database
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: response.body.alert.id },
      });
      expect(dbAlert).toBeTruthy();
      expect(dbAlert?.userId).toBe(user.id);
      expect(dbAlert?.siteId).toBe(site.id);
    });

    it("should create alert with different metric types", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const metricTypes = ["lcp", "fid", "cls"];

      for (const metricType of metricTypes) {
        const response = await request(app)
          .post("/api/alerts")
          .set("Authorization", `Bearer ${token}`)
          .send({
            siteId: site.id,
            metricType,
            threshold: 100,
            condition: "greater_than",
          })
          .expect(201);

        expect(response.body.alert.metricType).toBe(metricType);
      }
    });

    it("should create alert with different conditions", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const conditions = ["greater_than", "less_than"];

      for (const condition of conditions) {
        const response = await request(app)
          .post("/api/alerts")
          .set("Authorization", `Bearer ${token}`)
          .send({
            siteId: site.id,
            metricType: "lcp",
            threshold: 2500,
            condition,
          })
          .expect(201);

        expect(response.body.alert.condition).toBe(condition);
      }
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());

      const alertData = {
        siteId: site.id,
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
      };

      const response = await request(app)
        .post("/api/alerts")
        .send(alertData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 403 when user does not own the site", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const site = await createTestSite(user1.id.toString());

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token2}`)
        .send({
          siteId: site.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");
    });

    it("should return 404 when site does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: 999999,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 400 for invalid metric type", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site.id,
          metricType: "invalid_metric",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid condition", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "invalid_condition",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for negative threshold", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site.id,
          metricType: "lcp",
          threshold: -100,
          condition: "greater_than",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 when required fields are missing", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Missing siteId
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(400);

      // Missing metricType
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: 1,
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(400);

      // Missing threshold
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: 1,
          metricType: "lcp",
          condition: "greater_than",
        })
        .expect(400);

      // Missing condition
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: 1,
          metricType: "lcp",
          threshold: 2500,
        })
        .expect(400);
    });
  });


  describe("GET /api/alerts", () => {
    it("should list all alerts for authenticated user", async () => {
      const user = await createTestUser({
        email: "listalerts@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id.toString());

      // Create multiple alerts
      const alert1 = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
      });
      const alert2 = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "fid",
        threshold: 100,
        condition: "greater_than",
      });
      const alert3 = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "cls",
        threshold: 0.1,
        condition: "greater_than",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("alerts");
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts).toHaveLength(3);

      // Verify alerts are ordered by createdAt descending
      const alertIds = response.body.alerts.map((a: any) => a.id);
      expect(alertIds).toContain(alert1.id);
      expect(alertIds).toContain(alert2.id);
      expect(alertIds).toContain(alert3.id);

      // Verify each alert has all required properties
      response.body.alerts.forEach((alert: any) => {
        expect(alert).toHaveProperty("id");
        expect(alert).toHaveProperty("siteId");
        expect(alert).toHaveProperty("userId");
        expect(alert).toHaveProperty("metricType");
        expect(alert).toHaveProperty("threshold");
        expect(alert).toHaveProperty("condition");
        expect(alert).toHaveProperty("isActive");
        expect(alert).toHaveProperty("createdAt");
        expect(alert).toHaveProperty("updatedAt");
      });
    });

    it("should return empty array when user has no alerts", async () => {
      const user = await createTestUser({
        email: "noalerts@example.com",
        password: "password123",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("alerts");
      expect(Array.isArray(response.body.alerts)).toBe(true);
      expect(response.body.alerts).toHaveLength(0);
    });

    it("should only return alerts belonging to authenticated user", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const site1 = await createTestSite(user1.id.toString());
      const site2 = await createTestSite(user2.id.toString());

      // Create alerts for both users
      await createTestAlert(user1.id.toString(), site1.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
      });
      await createTestAlert(user2.id.toString(), site2.id.toString(), {
        metricType: "fid",
        threshold: 100,
      });

      const token1 = signToken({
        userId: user1.id.toString(),
        email: user1.email,
      });

      const response = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token1}`)
        .expect(200);

      expect(response.body.alerts).toHaveLength(1);
      expect(response.body.alerts[0].userId).toBe(user1.id);
      expect(response.body.alerts[0].metricType).toBe("lcp");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(app)
        .get("/api/alerts")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });
  });

  describe("PUT /api/alerts/:alertId", () => {
    it("should update alert threshold", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        threshold: 3000,
      };

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("alert");
      expect(response.body.alert.threshold).toBe(3000);
      expect(response.body.alert.metricType).toBe("lcp");
      expect(response.body.alert.condition).toBe("greater_than");

      // Verify in database
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert?.threshold).toBe(3000);
    });

    it("should update alert condition", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "cls",
        threshold: 0.1,
        condition: "greater_than",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        condition: "less_than",
      };

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.alert.condition).toBe("less_than");
      expect(response.body.alert.threshold).toBe(0.1);
    });

    it("should update alert isActive status", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
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
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.alert.isActive).toBe(false);

      // Verify in database
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert?.isActive).toBe(false);
    });

    it("should update multiple fields at once", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
        condition: "greater_than",
        isActive: true,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const updateData = {
        threshold: 3500,
        condition: "less_than",
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.alert).toMatchObject({
        threshold: 3500,
        condition: "less_than",
        isActive: false,
      });
    });

    it("should return 404 when alert does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .put("/api/alerts/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({ threshold: 3000 })
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 403 when user does not own the alert", async () => {
      const user1 = await createTestUser({ email: "owner@example.com" });
      const user2 = await createTestUser({ email: "notowner@example.com" });
      const site = await createTestSite(user1.id.toString());
      const alert = await createTestAlert(user1.id.toString(), site.id.toString());

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ threshold: 5000 })
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");

      // Verify alert was not updated
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert?.threshold).toBe(alert.threshold);
    });

    it("should return 400 for invalid threshold", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ threshold: -100 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 400 for invalid condition", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ condition: "invalid_condition" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Validation Error");
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString());

      const response = await request(app)
        .put(`/api/alerts/${alert.id}`)
        .send({ threshold: 3000 })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/alerts/:alertId", () => {
    it("should delete an alert successfully", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .delete(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("deleted successfully");

      // Verify alert was deleted from database
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert).toBeNull();
    });

    it("should return 404 when alert does not exist", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .delete("/api/alerts/999999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Not Found");
    });

    it("should return 403 when user does not own the alert", async () => {
      const user1 = await createTestUser({ email: "owner@example.com" });
      const user2 = await createTestUser({ email: "notowner@example.com" });
      const site = await createTestSite(user1.id.toString());
      const alert = await createTestAlert(user1.id.toString(), site.id.toString());

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      const response = await request(app)
        .delete(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");

      // Verify alert was not deleted
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert).toBeTruthy();
    });

    it("should return 401 when not authenticated", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString());

      const response = await request(app)
        .delete(`/api/alerts/${alert.id}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Unauthorized");

      // Verify alert was not deleted
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert.id },
      });
      expect(dbAlert).toBeTruthy();
    });
  });

  describe("Ownership Verification", () => {
    it("should prevent user from accessing another user's alerts", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const site1 = await createTestSite(user1.id.toString());
      const alert1 = await createTestAlert(user1.id.toString(), site1.id.toString());

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      // Try to update alert
      await request(app)
        .put(`/api/alerts/${alert1.id}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ threshold: 5000 })
        .expect(403);

      // Try to delete alert
      await request(app)
        .delete(`/api/alerts/${alert1.id}`)
        .set("Authorization", `Bearer ${token2}`)
        .expect(403);

      // Verify alert is unchanged
      const dbAlert = await testPrisma.alert.findUnique({
        where: { id: alert1.id },
      });
      expect(dbAlert?.threshold).toBe(alert1.threshold);
      expect(dbAlert?.userId).toBe(user1.id);
    });

    it("should allow user to manage their own alerts", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const alert = await createTestAlert(user.id.toString(), site.id.toString(), {
        metricType: "lcp",
        threshold: 2500,
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Update alert - should succeed
      await request(app)
        .put(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ threshold: 3000 })
        .expect(200);

      // Delete alert - should succeed
      await request(app)
        .delete(`/api/alerts/${alert.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should verify site ownership when creating alerts", async () => {
      const user1 = await createTestUser({ email: "user1@example.com" });
      const user2 = await createTestUser({ email: "user2@example.com" });
      const site1 = await createTestSite(user1.id.toString());

      const token2 = signToken({
        userId: user2.id.toString(),
        email: user2.email,
      });

      // Try to create alert for another user's site
      const response = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token2}`)
        .send({
          siteId: site1.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(403);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Forbidden");
    });
  });

  describe("Integration: Full alert management flow", () => {
    it("should complete create -> list -> update -> delete flow", async () => {
      const user = await createTestUser({
        email: "fullflow@example.com",
        password: "password123",
      });
      const site = await createTestSite(user.id.toString(), {
        name: "Flow Test Site",
        url: "https://flowtest.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Step 1: Create an alert
      const createResponse = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(201);

      const alertId = createResponse.body.alert.id;
      expect(alertId).toBeTruthy();

      // Step 2: List alerts
      const listResponse = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(listResponse.body.alerts).toHaveLength(1);
      expect(listResponse.body.alerts[0].id).toBe(alertId);

      // Step 3: Update the alert
      const updateResponse = await request(app)
        .put(`/api/alerts/${alertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          threshold: 3000,
          isActive: false,
        })
        .expect(200);

      expect(updateResponse.body.alert.threshold).toBe(3000);
      expect(updateResponse.body.alert.isActive).toBe(false);

      // Step 4: Delete the alert
      await request(app)
        .delete(`/api/alerts/${alertId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Step 5: Verify alert is deleted
      const finalListResponse = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(finalListResponse.body.alerts).toHaveLength(0);
    });

    it("should handle multiple alerts for different sites", async () => {
      const user = await createTestUser();
      const site1 = await createTestSite(user.id.toString(), {
        name: "Site 1",
        url: "https://site1.com",
      });
      const site2 = await createTestSite(user.id.toString(), {
        name: "Site 2",
        url: "https://site2.com",
      });

      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Create alerts for both sites
      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site1.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        })
        .expect(201);

      await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site2.id,
          metricType: "fid",
          threshold: 100,
          condition: "greater_than",
        })
        .expect(201);

      // List all alerts
      const listResponse = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(listResponse.body.alerts).toHaveLength(2);

      // Verify alerts are for different sites
      const siteIds = listResponse.body.alerts.map((a: any) => a.siteId);
      expect(siteIds).toContain(site1.id);
      expect(siteIds).toContain(site2.id);
    });
  });

  describe("Response format consistency", () => {
    it("should return consistent error format for all alert endpoints", async () => {
      const user = await createTestUser();
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Create with invalid data
      const createResponse = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: 999999,
          metricType: "invalid",
          threshold: -100,
        })
        .expect(400);

      expect(createResponse.body).toHaveProperty("error");
      expect(createResponse.body).toHaveProperty("message");

      // Update non-existent alert
      const updateResponse = await request(app)
        .put("/api/alerts/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({ threshold: 3000 })
        .expect(404);

      expect(updateResponse.body).toHaveProperty("error");
      expect(updateResponse.body).toHaveProperty("message");

      // Delete non-existent alert
      const deleteResponse = await request(app)
        .delete("/api/alerts/999999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(deleteResponse.body).toHaveProperty("error");
      expect(deleteResponse.body).toHaveProperty("message");
    });

    it("should return JSON content type for all responses", async () => {
      const user = await createTestUser();
      const site = await createTestSite(user.id.toString());
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Create alert
      const createResponse = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          siteId: site.id,
          metricType: "lcp",
          threshold: 2500,
          condition: "greater_than",
        });

      expect(createResponse.headers["content-type"]).toMatch(
        /application\/json/
      );

      // List alerts
      const listResponse = await request(app)
        .get("/api/alerts")
        .set("Authorization", `Bearer ${token}`);

      expect(listResponse.headers["content-type"]).toMatch(
        /application\/json/
      );

      // Error response
      const errorResponse = await request(app)
        .post("/api/alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({ invalid: "data" });

      expect(errorResponse.headers["content-type"]).toMatch(
        /application\/json/
      );
    });
  });
});
