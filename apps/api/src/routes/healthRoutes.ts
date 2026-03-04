import { Router } from "express";
import { testDatabaseConnection } from "../lib/prisma";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Check API server and database connectivity status
 *     responses:
 *       200:
 *         description: API server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: API server is running
 *                 database:
 *                   type: string
 *                   example: connected
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00.000Z
 *       503:
 *         description: Service unavailable - Database is unreachable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Database is unreachable
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      return res.status(503).json({
        status: "error",
        message: "Database is unreachable",
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      status: "ok",
      message: "API server is running",
      database: "connected",
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error instanceof Error ? error.message : error);
    return res.status(503).json({
      status: "error",
      message: "Database is unreachable",
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
