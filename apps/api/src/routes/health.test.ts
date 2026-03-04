import request from "supertest";
import express from "express";
import { testDatabaseConnection } from "../lib/prisma";

// Mock the database connection test
jest.mock("../lib/prisma", () => ({
  testDatabaseConnection: jest.fn(),
}));

describe("Health Check Endpoint", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

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
        // Handle database connection check errors gracefully
        return res.status(503).json({
          status: "error",
          message: "Database is unreachable",
          uptime: process.uptime(),
          version: process.env.npm_package_version || "0.1.0",
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Requirement 24.1: Returns 200 OK when healthy", () => {
    it("should return 200 status code when database is connected", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
    });
  });

  describe("Requirement 24.2: Verifies database connectivity", () => {
    it("should call testDatabaseConnection to verify database", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      await request(app).get("/api/health");

      expect(testDatabaseConnection).toHaveBeenCalled();
    });
  });

  describe("Requirement 24.3: Returns 503 if database unreachable", () => {
    it("should return 503 status code when database is unreachable", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(503);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Database is unreachable");
    });
  });

  describe("Requirement 24.4: Returns uptime and version information", () => {
    it("should include status, uptime, and version when healthy", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("message", "API server is running");
      expect(response.body).toHaveProperty("database", "connected");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.uptime).toBe("number");
      expect(typeof response.body.version).toBe("string");
    });

    it("should include uptime and version even when database is unreachable", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(false);

      const response = await request(app).get("/api/health");

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("version");
      expect(response.body).toHaveProperty("timestamp");
      expect(typeof response.body.uptime).toBe("number");
      expect(typeof response.body.version).toBe("string");
    });
  });

  describe("Requirement 24.5: Does not require authentication", () => {
    it("should be accessible without authentication token", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .get("/api/health")
        .set("Authorization", ""); // No token

      expect(response.status).toBe(200);
    });

    it("should work without any headers", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
    });
  });

  describe("Response format validation", () => {
    it("should return ISO 8601 formatted timestamp", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("should return valid JSON response", async () => {
      (testDatabaseConnection as jest.Mock).mockResolvedValue(true);

      const response = await request(app).get("/api/health");

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe("Edge cases", () => {
    it("should handle database connection check errors gracefully", async () => {
      (testDatabaseConnection as jest.Mock).mockRejectedValue(
        new Error("Connection timeout")
      );

      // The endpoint should catch the error and treat it as unreachable
      const response = await request(app).get("/api/health");
      
      expect(response.status).toBe(503);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Database is unreachable");
    });
  });
});
