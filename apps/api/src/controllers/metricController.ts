import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  validateSiteExists,
  submitMetric,
  getSiteWithOwnershipCheck,
  getMetrics,
  getMetricsSummary,
} from "../services/metricService";

/**
 * POST /api/metrics
 * Submit a new metric (public endpoint, authenticated via X-Site-ID header)
 * Requirements: 11.1-11.5
 */
export async function submit(req: Request, res: Response): Promise<void> {
  try {
    // Authenticate using X-Site-ID header
    const siteId = req.headers["x-site-id"] as string;

    if (!siteId) {
      res.status(401).json({
        error: "Unauthorized",
        message: "X-Site-ID header is required",
      });
      return;
    }

    // Validate siteId exists in database
    const site = await validateSiteExists(siteId);

    if (!site) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid site ID",
      });
      return;
    }

    // Store metric with timestamp
    const metric = await submitMetric(site.id, req.body);

    // Return success response immediately
    res.status(201).json({
      success: true,
      message: "Metric recorded successfully",
      metric: {
        id: metric.id,
        timestamp: metric.timestamp.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({
        error: statusCode === 400 ? "Bad Request" : "Internal Server Error",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/metrics/:siteId
 * Get metrics for a site with filters
 * Requirements: 12.1-12.5
 */
export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const siteId = req.params.siteId;

    if (!siteId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Site ID is required",
      });
      return;
    }

    // Verify user owns the site
    const site = await getSiteWithOwnershipCheck(siteId, userId);

    // Get metrics with filters from query params
    const metrics = await getMetrics(site.id, {
      timeRange: req.query.timeRange as string,
      deviceType: req.query.deviceType as string,
      browserName: req.query.browserName as string,
    });

    res.status(200).json({ metrics });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      const errorType =
        statusCode === 404
          ? "Not Found"
          : statusCode === 403
          ? "Forbidden"
          : "Internal Server Error";

      res.status(statusCode).json({
        error: errorType,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}


/**
 * GET /api/metrics/:siteId/summary
 * Get metrics summary for a site
 * Requirements: 13.1-13.5
 */
export async function getSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const siteId = req.params.siteId;

    if (!siteId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Site ID is required",
      });
      return;
    }

    // Verify user owns the site
    const site = await getSiteWithOwnershipCheck(siteId, userId);

    // Get metrics summary with filters from query params
    const summary = await getMetricsSummary(site.id, {
      timeRange: req.query.timeRange as string,
      deviceType: req.query.deviceType as string,
      browserName: req.query.browserName as string,
    });

    res.status(200).json({ summary });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      const errorType =
        statusCode === 404
          ? "Not Found"
          : statusCode === 403
          ? "Forbidden"
          : "Internal Server Error";

      res.status(statusCode).json({
        error: errorType,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}
