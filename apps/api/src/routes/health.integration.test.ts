import request from "supertest";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { testDatabaseConnection } from "../lib/prisma";

// Mock the database connection test
jest.mock("../lib/prisma", () => ({
  testDatabaseConnection: jest.fn(),
}));

describe("Health Check Endpoint - Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Configure CORS (same as main app)
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Site-ID"],
      })
    );

    app.use(express.json());

    // Rate limiting configuration (same as main app)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Lower limit for testing
      message: {
        error: "RateLimitError",
        message: "Too many requests from this IP, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const retryAfter = Math.ceil(15 * 60); // 15 minutes in seconds
        res.set("Retry-After", retryAfter.toString());
        res.status(429).json({
          error: "RateLimitError",
          message: "Too many requests from this IP, please try again later.",
        });
      },
      // Exclude health check from rate limiting
      skip: (req) => req.url === "/api/health",
    });

    // Apply rate limiting to all routes
    app.use(limiter);

    // Health check endpoint (same implementation as in index.ts)
    app.get("/api/health", async (req, res) => {
      try {
        const dbConnected = await testDatabaseConnection();

        if (!dbConnected) {
          return res.status(503).json({
            status: "error",
            message: "Database is unreachable",
            uptime: process.uptime(),
            version: process.env.npm_package_version || "0.1.0",
            timestamp: new Date().toISOString(),
          });
        }

        res.json({
          status: "ok",
          message: "API server is running",
          database: "connected",
          uptime: process.uptime(),
          version: process.env.npm_package_version || "0.1.0",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(503).json({
          status: "error",
          message: "Database is unreachable",
          uptime: process.uptime(),
          version: process.env.npm_package_version || "0.1.0",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Test endpoint to verify rate limiting works
    app.get("/api/test", (req, res) => {
      res.json({ message: "test endpoint" });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Integration: Health check with rate limiting", () => {
    it("should not be affected by rate limiting", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      // Make multiple requests to health check (more than rate limit)
      for (let i = 0; i < 10; i++) {
        const response = await request(app).get("/api/health");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
      }
    });

    it("should allow health checks even when other endpoints are rate limited", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      // Exhaust rate limit on test endpoint
      for (let i = 0; i < 6; i++) {
        await request(app).get("/api/test");
      }

      // Verify test endpoint is rate limited
      const testResponse = await request(app).get("/api/test");
      expect(testResponse.status).toBe(429);

      // Health check should still work
      const healthResponse = await request(app).get("/api/health");
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.status).toBe("ok");
    });
  });

  describe("Integration: Health check without authentication", () => {
    it("should work without Authorization header", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
    });

    it("should work with invalid Authorization header", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get("/api/health")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ok");
    });
  });

  describe("Integration: Database connectivity scenarios", () => {
    it("should return healthy status when database is connected", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: "ok",
        message: "API server is running",
        database: "connected",
      });
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.version).toBeTruthy();
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should return unhealthy status when database is disconnected", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: "error",
        message: "Database is unreachable",
      });
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.version).toBeTruthy();
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should handle database connection errors gracefully", async () => {
      (testDatabaseConnection as jest.Mock).mockRejectedValue(
        new Error("Connection timeout")
      );

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: "error",
        message: "Database is unreachable",
      });
    });
  });

  describe("Integration: Response format", () => {
    it("should return proper JSON content type", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("should include all required fields in healthy response", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("database");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should include all required fields in unhealthy response", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
